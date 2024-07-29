import { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { format } from 'url'

import ErrorMessage from '../../ErrorMessage'
import Consents, { getConsentsError } from '../../Pledge/Consents'

import withT from '../../../lib/withT'
import withMe, { meQuery } from '../../../lib/apollo/withMe'
import isEmail from 'validator/lib/isEmail'
import { trackEvent } from '@app/lib/analytics/event-tracking'
import { intersperse } from '../../../lib/utils/helpers'
import SwitchBoard from '../../Auth/SwitchBoard'
import FieldSet from '../../FieldSet'

import { withSignOut } from '../../Auth/SignOut'
import { withSignIn } from '../../Auth/SignIn'

import { css } from 'glamor'

import {
  Field,
  Button,
  Interaction,
  InlineSpinner,
  colors,
  fontStyles,
  mediaQueries,
} from '@project-r/styleguide'

const { H2, P } = Interaction

const styles = {
  button: css({
    width: 160,
    textAlign: 'center',
  }),
  personalMessageContainer: css({
    display: 'flex',
    gap: 16,
    [mediaQueries.mUp]: {
      gap: 32,
      padding: '16px 0',
    },
  }),
  messages: css({
    minHeight: 100,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  }),
  personalMessage: css({
    ...fontStyles.serifRegular19,
    margin: 0,
    [mediaQueries.mUp]: {
      ...fontStyles.serifRegular25,
    },
  }),
  granterImage: css({
    width: 128,
    height: 128,
    [mediaQueries.mUp]: {
      width: 96,
      height: 96,
    },
  }),
}

const isMembershipVoucherCode = (voucherCode) => {
  return voucherCode.length === 6
}

const voucherCodeForMembership = (voucherCode) => {
  return voucherCode.length === 6 || voucherCode.length === 7
}

const isAccessGrantVoucherCode = (voucherCode) => {
  return voucherCode.length === 5 || voucherCode.length === 7
}

export const sanitizeVoucherCode = (value) => {
  return value
    .replace(/[^a-zA-Z0-9]/g, '')
    .trim()
    .substr(0, 7)
    .toUpperCase()
}

const relocateToOnboarding = (context) => {
  window.location = format({ pathname: `/einrichten`, query: { context } })
}

class ClaimMembership extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      serverError: undefined,
      consents: [],
      values: {},
      errors: {},
      dirty: {},
      signInResponse: {},
    }
  }
  handleFirstName(value, shouldValidate, t) {
    this.setState(
      FieldSet.utils.mergeField({
        field: 'firstName',
        value,
        error:
          value.trim().length <= 0 && t('pledge/contact/firstName/error/empty'),
        dirty: shouldValidate,
      }),
    )
  }
  handleLastName(value, shouldValidate, t) {
    this.setState(
      FieldSet.utils.mergeField({
        field: 'lastName',
        value,
        error:
          value.trim().length <= 0 && t('pledge/contact/lastName/error/empty'),
        dirty: shouldValidate,
      }),
    )
  }
  handleEmail(value, shouldValidate, t) {
    this.setState(
      FieldSet.utils.mergeField({
        field: 'email',
        value,
        error:
          (value.trim().length <= 0 && t('pledge/contact/email/error/empty')) ||
          (!isEmail(value) && t('pledge/contact/email/error/invalid')),
        dirty: shouldValidate,
      }),
    )
  }
  handleVoucherCode(value, shouldValidate, t) {
    const sanitizedValue = sanitizeVoucherCode(value)
    this.setState(
      FieldSet.utils.mergeField({
        field: 'voucherCode',
        value,
        error:
          (sanitizedValue.length === 0 &&
            t('memberships/claim/voucherCode/label/error/empty')) ||
          (!isMembershipVoucherCode(sanitizedValue) &&
            !isAccessGrantVoucherCode(sanitizedValue) &&
            t('memberships/claim/voucherCode/label/error/unrecognized')),
        dirty: shouldValidate,
      }),
    )
  }
  checkUserFields({ me, t }) {
    const defaultValues = {
      firstName: (me && me.firstName) || '',
      lastName: (me && me.lastName) || '',
      email: (me && me.email) || this.props.email || '',
      voucherCode: this.props.voucherCode || '',
    }
    const values = {
      ...defaultValues,
      ...this.state.values,
    }
    this.handleFirstName(values.firstName, false, t)
    this.handleLastName(values.lastName, false, t)
    this.handleEmail(values.email, false, t)
    this.handleVoucherCode(values.voucherCode, false, t)
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.me !== this.props.me) {
      this.checkUserFields(nextProps)
    }
  }
  componentDidMount() {
    this.checkUserFields(this.props)
  }
  claim(newTokenType) {
    const { me, context, accessToken } = this.props
    const { values } = this.state

    this.setState(() => ({
      loading: true,
    }))

    const catchError = (error) => {
      this.setState(() => ({
        loading: false,
        serverError: error,
      }))

      return error
    }

    if (me && me.email !== values.email) {
      this.props
        .signOut()
        .then(() => {
          this.claim()
        })
        .catch(catchError)
      return
    }

    if (!me) {
      this.props
        .signIn(
          values.email,
          context || 'claim',
          this.state.consents,
          newTokenType || 'EMAIL_CODE',
          accessToken,
        )
        .then(({ data }) => {
          this.setState({
            polling: true,
            signInResponse: data.signIn,
          })
        })
        .catch(catchError)
      return
    }

    const claim = () => {
      const code = sanitizeVoucherCode(values.voucherCode)
      const context = voucherCodeForMembership(code) ? 'claim' : 'access'

      const claimWith = (mutation, { code, context = 'unknown' }) =>
        mutation(code)
          .then(() => {
            trackEvent(['MembershipsClaim', 'claim success', context])
          })
          .then(() => relocateToOnboarding(context))
          .catch(catchError)

      if (isAccessGrantVoucherCode(code)) {
        claimWith(this.props.claimAccess, { code, context })
      } else {
        claimWith(this.props.claimMembership, { code, context })
      }
    }

    if (me.firstName !== values.firstName || me.lastName !== values.lastName) {
      this.props
        .updateName({
          firstName: values.firstName,
          lastName: values.lastName,
        })
        .then(() => {
          claim()
        })
        .catch(catchError)
      return
    }

    claim()
  }
  render() {
    const { context, t, accessGrantInfo, accessToken } = this.props

    const {
      consents,
      dirty,
      errors,
      loading,
      polling,
      serverError,
      showErrors,
      signInResponse,
      values,
    } = this.state

    const requiredConsents = ['PRIVACY', 'TOS']

    if (values.voucherCode && voucherCodeForMembership(values.voucherCode)) {
      requiredConsents.push('STATUTE')
    }

    const contextLead = t.first(
      [
        accessGrantInfo?.granterName
          ? `memberships/claim/personal/lead`
          : `memberships/claim/${context}/lead`,
        'memberships/claim/lead',
      ],
      {
        name: accessGrantInfo?.granterName,
      },
    )

    const {
      tokenType = false,
      phrase = false,
      alternativeFirstFactors = [],
    } = signInResponse

    const alternativeFirstFactorsIncludingEmailCode = Array.from(
      new Set(
        alternativeFirstFactors
          .concat(['EMAIL_CODE'])
          .filter((tt) => tt !== signInResponse.tokenType),
      ),
    )

    const errorMessages = Object.keys(errors)
      .map((key) => errors[key])
      .concat([getConsentsError(t, requiredConsents, consents)])
      .filter(Boolean)

    return (
      <Fragment>
        <div
          style={{ opacity: polling || loading ? 0.6 : 1, marginBottom: 40 }}
        >
          <H2 style={{ marginBottom: 20 }}>{contextLead}</H2>
          {accessGrantInfo?.message && (
            <div {...styles.personalMessageContainer}>
              {accessGrantInfo.granter?.portrait && (
                <img
                  src={accessGrantInfo.granter.portrait}
                  style={{ width: 100, height: 100 }}
                />
              )}
              <div {...styles.messages}>
                <p {...styles.personalMessage}>
                  «
                  {intersperse(accessGrantInfo.message.split('\n'), (_, i) => (
                    <br key={i} />
                  ))}
                  »
                </p>
              </div>
            </div>
          )}

          <Field
            label={t('memberships/claim/voucherCode/label')}
            name='voucherCode'
            error={dirty.voucherCode && errors.voucherCode}
            value={values.voucherCode}
            disabled={polling || loading}
            autoComplete={'false'}
            onChange={(_, value, shouldValidate) => {
              this.handleVoucherCode(value, shouldValidate, t)
            }}
          />
          <br />
          <Field
            label={t('pledge/contact/email/label')}
            name='email'
            type='email'
            error={dirty.email && errors.email}
            value={values.email}
            disabled={polling || loading}
            onChange={(_, value, shouldValidate) => {
              this.handleEmail(value, shouldValidate, t)
            }}
          />
          <br />
          <Field
            label={t('pledge/contact/firstName/label')}
            name='firstName'
            error={dirty.firstName && errors.firstName}
            value={values.firstName}
            disabled={polling || loading}
            onChange={(_, value, shouldValidate) => {
              this.handleFirstName(value, shouldValidate, t)
            }}
          />
          <br />
          <Field
            label={t('pledge/contact/lastName/label')}
            name='lastName'
            error={dirty.lastName && errors.lastName}
            value={values.lastName}
            disabled={polling || loading}
            onChange={(_, value, shouldValidate) => {
              this.handleLastName(value, shouldValidate, t)
            }}
          />
          <br />
          <br />
          <P>{t('memberships/claim/addendum')}</P>
          <br />
          <br />
          {!!showErrors && errorMessages.length > 0 && (
            <div style={{ color: colors.error, marginBottom: 40 }}>
              {t('memberships/claim/error/title')}
              <br />
              <ul>
                {errorMessages.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          <Consents
            required={requiredConsents}
            accepted={consents}
            onChange={(keys) => {
              this.setState(() => ({
                consents: keys,
              }))
            }}
            disabled={polling || loading}
          />
          {!!serverError && <ErrorMessage error={serverError} />}
        </div>
        <div>
          {!polling && (
            <div {...styles.button}>
              {loading ? (
                <InlineSpinner />
              ) : (
                <Button
                  primary
                  disabled={this.state.showErrors && errorMessages.length > 0}
                  onClick={() => {
                    if (errorMessages.length) {
                      this.setState((state) => ({
                        showErrors: true,
                        dirty: {
                          ...state.dirty,
                          firstName: true,
                          lastName: true,
                          email: true,
                          voucherCode: true,
                        },
                      }))
                      return
                    }
                    this.claim()
                  }}
                >
                  {t('memberships/claim/button')}
                </Button>
              )}
            </div>
          )}
          {polling && (
            <SwitchBoard
              tokenType={tokenType}
              phrase={phrase}
              email={values.email}
              accessToken={accessToken}
              alternativeFirstFactors={
                alternativeFirstFactorsIncludingEmailCode
              }
              onCancel={() => {
                this.setState(() => ({
                  polling: false,
                  loading: false,
                }))
              }}
              onTokenTypeChange={(altTokenType) => {
                this.setState(
                  () => ({ polling: false }),
                  () => this.claim(altTokenType),
                )
              }}
              onSuccess={(me) => {
                this.setState(
                  () => ({
                    values: { ...this.state.values, email: me.email },
                    polling: false,
                  }),
                  () => this.claim(),
                )
              }}
            />
          )}
        </div>
      </Fragment>
    )
  }
}

ClaimMembership.propTypes = {
  me: PropTypes.object,
  t: PropTypes.func.isRequired,
}

const claimMembership = gql`
  mutation claimMembership($voucherCode: String!) {
    claimMembership(voucherCode: $voucherCode)
  }
`

const claimAccess = gql`
  mutation claimAccess($voucherCode: String!) {
    claimAccess(voucherCode: $voucherCode) {
      endAt
    }
  }
`

const updateName = gql`
  mutation updateName($firstName: String!, $lastName: String!) {
    updateMe(firstName: $firstName, lastName: $lastName) {
      id
    }
  }
`

const accessGrantInfo = gql`
  query accessGrantInfoQuery($id: ID!) {
    accessGrantInfo(id: $id) {
      granter {
        portrait
      }
      granterName
      message
    }
  }
`

export default compose(
  graphql(accessGrantInfo, {
    skip: (props) => !props.grantId,
    options: ({ grantId }) => ({
      variables: {
        id: grantId,
      },
    }),
    props: ({ data }) => {
      return {
        accessGrantInfo: data.accessGrantInfo,
      }
    },
  }),
  graphql(claimMembership, {
    props: ({ mutate }) => ({
      claimMembership: (voucherCode) =>
        mutate({
          variables: {
            voucherCode,
          },
        }),
    }),
  }),
  graphql(claimAccess, {
    props: ({ mutate }) => ({
      claimAccess: (voucherCode) =>
        mutate({
          variables: {
            voucherCode,
          },
        }),
    }),
  }),
  graphql(updateName, {
    props: ({ mutate }) => ({
      updateName: (variables) =>
        mutate({
          variables,
          refetchQueries: [
            {
              query: meQuery,
            },
          ],
        }),
    }),
  }),
  withSignOut,
  withSignIn,
  withMe,
  withT,
)(ClaimMembership)
