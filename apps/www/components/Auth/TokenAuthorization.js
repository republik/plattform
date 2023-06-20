import { Fragment, Component } from 'react'
import { css } from 'glamor'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'

import {
  Button,
  InlineSpinner,
  Loader,
  Interaction,
  Label,
  fontFamilies,
  colors,
  FieldSet,
} from '@project-r/styleguide'

import Consents, { getConsentsError } from '../Pledge/Consents'

import withT from '../../lib/withT'
import { meQuery } from '../../lib/apollo/withMe'
import { reportError } from '../../lib/errors/reportError'

import ErrorMessage from '../ErrorMessage'

import Me from './Me'

import withAuthorizeSession from './withAuthorizeSession'
import { withRouter } from 'next/router'

const styles = {
  actions: css({
    display: 'flex',
    justifyContent: 'space-between',
    '& button': {
      width: ['48%', 'calc(50% - 5px)'],
    },
  }),
}

const { P } = Interaction

const shouldAutoAuthorize = ({ error, target, noAutoAuthorize }) => {
  return (
    !error &&
    target &&
    target.session.isCurrent &&
    !target.requiredConsents.length &&
    !target.requiredFields.length &&
    !noAutoAuthorize
  )
}

class TokenAuthorization extends Component {
  constructor(props) {
    super(props)

    this.state = {
      values: {},
      errors: {},
      dirty: {},
    }
  }

  goTo = (type, email, context) => {
    const { router } = this.props
    if (this.props.goTo) {
      this.props.goTo(type, email, context)
      return
    }
    router.replace({
      pathname: '/mitteilung',
      query: { type, email, context },
    })
  }

  authorize() {
    if (this.state.authorizing) {
      return
    }

    const { email, tokenType, token, authorizeSession, context } = this.props

    this.setState(
      {
        authorizing: true,
      },
      () => {
        authorizeSession({
          email,
          tokens: [{ type: tokenType, payload: token }],
          consents: this.state.consents,
          requiredFields:
            Object.keys(this.state.values).length > 0
              ? this.state.values
              : undefined,
        })
          .then(() => this.goTo('email-confirmed', email, context))
          .catch((error) => {
            this.setState({
              authorizing: false,
              authorizeError: error,
            })
          })
      },
    )
  }
  deny() {
    if (this.state.authorizing) {
      return
    }

    const { email, deny, context } = this.props

    this.setState(
      {
        authorizing: true,
      },
      () => {
        deny()
          .then(() => this.goTo('session-denied', email, context))
          .catch((error) => {
            this.setState({
              authorizing: false,
              authorizeError: error,
            })
          })
      },
    )
  }
  autoAuthorize() {
    if (
      !this.state.authorizing &&
      !this.state.authorizeError &&
      shouldAutoAuthorize(this.props)
    ) {
      this.authorize()
    }
  }
  componentDidMount() {
    this.autoAuthorize()
  }
  componentDidUpdate() {
    this.autoAuthorize()
  }
  render() {
    const { t, target, echo, email, error, loading, noAutoAuthorize } =
      this.props

    if (error) {
      return (
        <Fragment>
          <P>{t('tokenAuthorization/error')}</P>
          <ErrorMessage error={error} />
          <div style={{ marginTop: 80, marginBottom: 80 }}>
            <Me email={email} />
          </div>
        </Fragment>
      )
    }

    return (
      <Loader
        loading={loading || shouldAutoAuthorize(this.props)}
        render={() => {
          if (!target) {
            reportError(
              'TokenAuthorization !target',
              JSON.stringify(this.props.data, null, 2),
            )
          }
          const { authorizeError, consents, values, dirty, errors } = this.state

          const errorMessages = Object.keys(errors)
            .map((key) => errors[key])
            .concat(getConsentsError(t, target.requiredConsents, consents))
            .filter(Boolean)

          const { country, city, ipAddress, userAgent, phrase, isCurrent } =
            target.session
          const showSessionInfo = !isCurrent || noAutoAuthorize
          return (
            <Fragment>
              <P>
                {t(
                  `tokenAuthorization/title/${
                    showSessionInfo
                      ? 'sessionInfo'
                      : target.newUser
                      ? 'new'
                      : 'existing'
                  }`,
                )}
              </P>
              {showSessionInfo && (
                <Fragment>
                  <P
                    style={{
                      fontFamily:
                        userAgent !== echo.userAgent
                          ? fontFamilies.sansSerifMedium
                          : undefined,
                    }}
                  >
                    {userAgent}
                  </P>
                  <P>
                    <Label>{t('tokenAuthorization/location')}</Label>
                    <br />
                    {!!city && (
                      <span
                        style={{
                          fontFamily:
                            city !== echo.city
                              ? fontFamilies.sansSerifMedium
                              : undefined,
                        }}
                      >
                        {city}
                        {', '}
                      </span>
                    )}
                    <span
                      style={
                        country !== echo.country
                          ? {
                              fontFamily: fontFamilies.sansSerifMedium,
                              color: colors.error,
                            }
                          : {}
                      }
                    >
                      {country || t('tokenAuthorization/location/unknown')}
                    </span>
                  </P>
                  {echo.ipAddress !== ipAddress && (
                    <P>
                      <Label>{t('tokenAuthorization/ip')}</Label>
                      <br />
                      {ipAddress}
                    </P>
                  )}
                </Fragment>
              )}
              <P>
                <Label>{t('tokenAuthorization/email')}</Label>
                <br />
                <span>{email}</span>
              </P>
              {showSessionInfo && (
                <P>
                  <Label>{t('tokenAuthorization/phrase')}</Label>
                  <br />
                  <span
                    style={{
                      fontFamily: !isCurrent
                        ? fontFamilies.sansSerifMedium
                        : undefined,
                    }}
                  >
                    {phrase}
                  </span>
                </P>
              )}
              {!!target.requiredFields.length && (
                <div style={{ marginTop: 20 }}>
                  <Interaction.P>
                    {t('tokenAuthorization/fields/explanation')}
                  </Interaction.P>
                  <FieldSet
                    values={values}
                    errors={errors}
                    dirty={dirty}
                    onChange={(fields) => {
                      this.setState((state) => ({
                        authorizeError: undefined,
                        ...FieldSet.utils.mergeFields(fields)(state),
                      }))
                    }}
                    fields={target.requiredFields.map((field) => ({
                      label: t(`tokenAuthorization/fields/label/${field}`),
                      name: field,
                      validator: (value) =>
                        value.trim().length <= 0 &&
                        t(`tokenAuthorization/fields/error/${field}/missing`),
                    }))}
                  />
                </div>
              )}
              {!!target.requiredConsents.length && (
                <div style={{ marginTop: 20, textAlign: 'left' }}>
                  <Consents
                    accepted={consents}
                    required={target.requiredConsents}
                    onChange={(keys) => {
                      this.setState({
                        consents: keys,
                        authorizeError: undefined,
                      })
                    }}
                  />
                </div>
              )}
              {!!authorizeError && <ErrorMessage error={authorizeError} />}
              <br />
              {!!this.state.showErrors && errorMessages.length > 0 && (
                <div style={{ color: colors.error, marginBottom: 20 }}>
                  <ul>
                    {errorMessages.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              {this.state.authorizing ? (
                <div style={{ textAlign: 'center' }}>
                  <InlineSpinner />
                </div>
              ) : (
                <div {...styles.actions}>
                  <Button
                    style={{
                      minWidth: 80,
                      opacity: errorMessages.length ? 0.5 : 1,
                    }}
                    primary
                    block
                    onClick={() => {
                      if (errorMessages.length) {
                        this.setState((state) =>
                          Object.keys(state.errors).reduce(
                            (nextState, key) => {
                              nextState.dirty[key] = true
                              return nextState
                            },
                            {
                              showErrors: true,
                              dirty: {},
                            },
                          ),
                        )
                        return
                      }
                      this.authorize()
                    }}
                  >
                    {t('tokenAuthorization/grant')}
                  </Button>
                  <Button
                    style={{
                      minWidth: 80,
                    }}
                    block
                    onClick={() => {
                      this.deny()
                    }}
                  >
                    {t('tokenAuthorization/deny')}
                  </Button>
                </div>
              )}
              <br />
              <Label>{t('tokenAuthorization/after')}</Label>
              <br />
              <br />
            </Fragment>
          )
        }}
      />
    )
  }
}

const denySession = gql`
  mutation denySession($email: String!, $token: SignInToken!) {
    denySession(email: $email, token: $token)
  }
`

const unauthorizedSessionQuery = gql`
  query unauthorizedSession(
    $email: String!
    $token: String!
    $tokenType: SignInTokenType!
  ) {
    echo {
      ipAddress
      userAgent
      country
      city
    }
    target: unauthorizedSession(
      email: $email
      token: { type: $tokenType, payload: $token }
    ) {
      newUser
      enabledSecondFactors
      requiredConsents
      requiredFields
      session {
        ipAddress
        userAgent
        country
        city
        phrase
        isCurrent
      }
    }
  }
`

export default compose(
  withT,
  withAuthorizeSession,
  withRouter,
  graphql(denySession, {
    props: ({ ownProps: { email, token, tokenType }, mutate }) => ({
      deny: () =>
        mutate({
          variables: {
            email,
            token: { type: tokenType, payload: token },
          },
          refetchQueries: [{ query: meQuery }],
        }),
    }),
  }),
  graphql(unauthorizedSessionQuery, {
    props: ({ data }) => {
      return {
        data,
        target: data.target,
        echo: data.echo,
        loading: data.loading,
        error: data.error,
      }
    },
    options: {
      // no server rendering for proper echo
      ssr: false,
    },
  }),
)(TokenAuthorization)
