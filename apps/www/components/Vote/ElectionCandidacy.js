import React, { Fragment } from 'react'
import { withRouter } from 'next/router'
import ErrorMessage from '../ErrorMessage'
import voteT from './voteT'
import { isURL } from 'validator'

import {
  A,
  colors,
  InlineSpinner,
  Interaction,
  Button,
  Label,
  mediaQueries,
} from '@project-r/styleguide'
import withT from '../../lib/withT'
import FieldSet from '../FieldSet'

import { gql } from '@apollo/client'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { formatDate, swissTime } from '../../lib/utils/format'
import { css } from 'glamor'
import ElectionBallotRow from './ElectionBallotRow'
import { Body, Section, Small } from './text'
import Portrait from '../Profile/Portrait'
import { COUNTRIES } from '../Account/AddressForm'
import UsernameField from '../Profile/UsernameField'
import GenderField from '../Profile/GenderField'
import withMe from '../../lib/apollo/withMe'
import Loader from '../Loader'
import SignIn from '../Auth/SignIn'

const { H2, P } = Interaction

const birthdayFormat = '%d.%m.%Y'
const birthdayParse = swissTime.parse(birthdayFormat)

const DEFAULT_COUNTRY = COUNTRIES[0]
const PUBLIC_URL_PREFIX = 'https://'

const addressFields = (t) => [
  {
    label: t('Account/AddressForm/line1/label'),
    name: 'line1',
    validator: (value) => !value && t('Account/AddressForm/line1/error/empty'),
  },
  {
    label: t('Account/AddressForm/line2/label'),
    name: 'line2',
  },
  {
    label: t('Account/AddressForm/postalCode/label'),
    name: 'postalCode',
    validator: (value) =>
      !value && t('Account/AddressForm/postalCode/error/empty'),
  },
  {
    label: t('Account/AddressForm/city/label'),
    name: 'city',
    validator: (value) => !value && t('Account/AddressForm/city/error/empty'),
  },
  {
    label: t('Account/AddressForm/country/label'),
    name: 'country',
    validator: (value) =>
      !value && t('Account/AddressForm/country/error/empty'),
  },
]

const fields = (t, vt) => [
  {
    label: t('Account/Update/birthday/label'),
    name: 'birthday',
    mask: '11.11.1111',
    maskChar: '_',
    validator: (value) => {
      const parsedDate = birthdayParse(value)
      return (
        (parsedDate === null ||
          parsedDate > new Date() ||
          parsedDate < new Date(1798, 3, 12)) &&
        t('Account/Update/birthday/error/invalid')
      )
    },
  },
  {
    label: vt('info/candidacy/credential'),
    name: 'credential',
    validator: (value) => {
      return (
        ((!value || value === '') && vt('info/candidacy/credentialMissing')) ||
        (value.trim().length >= 40 && t('profile/credentials/errors/tooLong'))
      )
    },
  },
  {
    label: vt('info/candidacy/statement'),
    name: 'statement',
    autoSize: true,
    validator: (value) =>
      (!value && vt('info/candidacy/statementMissing')) ||
      (value.trim().length >= 140 && t('profile/statement/tooLong')),
  },
  {
    label: vt('info/candidacy/biography'),
    name: 'biography',
    autoSize: true,
    validator: (value) =>
      (!value && vt('info/candidacy/biographyMissing')) ||
      (value.trim().length >= 1500 && t('profile/biography/label/tooLong')),
  },
  {
    label: t('profile/disclosures/label'),
    explanation: <Label>{t('profile/disclosures/explanation')}</Label>,
    name: 'disclosures',
    autoSize: true,
    validator: (value) =>
      !!value && value.trim().length >= 140 && t('profile/statement/tooLong'),
  },
  {
    label: t('profile/contact/facebook/label'),
    name: 'facebookId',
  },
  {
    label: t('profile/contact/twitter/label'),
    name: 'twitterHandle',
  },
  {
    label: t('profile/contact/publicUrl/label'),
    name: 'publicUrl',
    validator: (value) =>
      !!value &&
      !isURL(value, { require_protocol: true, protocols: ['http', 'https'] }) &&
      value !== PUBLIC_URL_PREFIX &&
      t('profile/contact/publicUrl/error'),
  },
]

const styles = {
  previewWrapper: css({
    margin: '20px 0',
  }),
  vSpace: css({
    marginTop: 20,
  }),
  section: css({
    marginTop: 40,
  }),
  error: css({
    color: colors.error,
  }),
  saveButton: css({
    textAlign: 'center',
    width: 300,
    position: 'relative',
    [mediaQueries.onlyS]: {
      width: '100%',
    },
  }),
}

class ElectionCandidacy extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isEditing: !!props.router.query.edit || false,
      showErrors: true,
      errors: {},
      dirty: {},
      ...this.deriveStateFromProps(props),
    }

    this.startEditing = () => {
      this.setState({ isEditing: true })
    }

    this.save = () => {
      const { updateCandidacy, me, slug } = this.props
      const { values } = this.state

      this.setState({ updating: true })

      return updateCandidacy({
        slug: slug,
        username: values.username,
        statement: values.statement,
        credential: values.credential,
        disclosures: values.disclosures,
        birthday:
          values.birthday && values.birthday.length
            ? values.birthday.trim()
            : null,
        gender: values.genderCustom || values.gender,
        biography: values.biography,
        portrait: values.portraitPreview ? values.portrait : undefined,
        address: {
          name: (me && me.address && me.address.name) || me.name,
          line1: values.line1,
          line2: values.line2,
          postalCode: values.postalCode,
          city: values.city,
          country: values.country,
        },
        publicUrl:
          values.publicUrl === PUBLIC_URL_PREFIX ? '' : values.publicUrl,
        twitterHandle: values.twitterHandle,
        facebookId: values.facebookId,
      })
        .then(() => {
          return new Promise((resolve) => setTimeout(resolve, 200)) // insert delay to slow down UI
        })
        .then(() => {
          this.setState(() => ({
            isEditing: false,
            updating: false,
            error: null,
          }))
        })
        .then(() => window.scrollTo(0, 0))
        .catch((error) => {
          this.setState(() => ({
            updating: false,
            error,
          }))
        })
    }

    this.cancel = async () => {
      const { cancelCandidacy, slug } = this.props
      cancelCandidacy(slug)
        .then(() => {
          this.setState(() => ({
            isEditing: false,
            error: null,
          }))
        })
        .then(() => window.scrollTo(0, 0))
        .catch((error) => {
          this.setState(() => ({
            updating: false,
            error,
          }))
        })
    }

    this.onChange = (fields) => {
      this.setState(FieldSet.utils.mergeFields(fields))
    }
  }

  deriveStateFromProps({ data, slug }) {
    const {
      statement,
      birthday,
      disclosures,
      credentials,
      address,
      gender,
      biography,
      biographyContent,
      publicUrl,
      twitterHandle,
      facebookId,
    } = data.me || {}
    const {
      line1,
      line2,
      city,
      postalCode,
      country = DEFAULT_COUNTRY,
    } = address || {}

    const candidacy = data.me?.candidacies?.find(
      (c) => c.election.slug === slug,
    )
    const credential =
      candidacy?.credential || credentials?.find((c) => c.isListed)

    return {
      values: {
        gender,
        biography,
        biographyContent,
        statement,
        birthday,
        disclosures,
        publicUrl: publicUrl || PUBLIC_URL_PREFIX,
        twitterHandle,
        facebookId,
        line1,
        line2,
        city,
        postalCode,
        country,
        credential: credential ? credential.description : undefined,
      },
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.data.me && nextProps.data.me !== this.props.data.me) {
      this.setState(this.deriveStateFromProps(nextProps))
    }
  }

  render() {
    const { t, vt, data, slug } = this.props

    return (
      <Loader
        loading={data.loading}
        error={data.error}
        render={() => {
          const { me, election } = data
          if (!election) {
            return null
          }
          if (!election.userIsEligible) {
            return (
              <>
                <H2>{t('withMembership/title')}</H2>
                {!me && (
                  <div style={{ margin: '20px 0' }}>
                    <SignIn />
                  </div>
                )}
                <P style={{ marginTop: 20 }}>
                  {vt('info/candidacy/notEligable')}
                </P>
              </>
            )
          }
          const { values, errors, error, dirty, isEditing, updating } =
            this.state

          const candidate =
            !updating &&
            me.candidacies &&
            me.candidacies.find((c) => c.election.slug === slug)
          const combinedErrors = {
            username:
              values.username || me.username
                ? undefined
                : vt('common/missingUsername'),
            ...errors,
          }

          const isValid = !Object.keys(combinedErrors).some((k) =>
            Boolean(combinedErrors[k]),
          )

          const { name } = me
          const {
            statement,
            birthday,
            disclosures,
            credential,
            city,
            portrait,
            portraitPreview,
            biography,
            biographyContent,
            gender,
            publicUrl,
            twitterHandle,
            facebookId,
          } = values
          const parsedBirthday = birthdayParse(birthday)

          const candidacyPreview = me && {
            user: {
              id: me.id,
              username: me.username,
              name,
              statement,
              disclosures,
              portrait:
                portraitPreview ||
                (portrait !== null ? me.portrait : undefined),
              biography,
              biographyContent,
              gender,
              publicUrl,
              twitterHandle,
              facebookId,
            },
            city,
            yearOfBirth: parsedBirthday
              ? parsedBirthday.getFullYear()
              : undefined,
            credential,
            recommendation: candidate ? candidate.recommendation : undefined,
          }

          const endDate = new Date(election.candidacyEndDate)
          if (new Date() >= endDate) {
            return <P>{vt('vote/candidacy/tooLate')}</P>
          }

          return (
            <>
              <div>
                {isEditing || !candidate ? (
                  <Fragment>
                    <Section>
                      <H2>{t('Account/Update/address/label')}</H2>
                      <div {...styles.vSpace}>
                        <FieldSet
                          values={values}
                          errors={errors}
                          dirty={dirty}
                          fields={addressFields(t)}
                          onChange={this.onChange}
                          isEditing
                        />
                      </div>
                    </Section>
                    <Section>
                      <H2>{vt('info/candidacy/candidacyTitle')}</H2>
                      <div
                        {...styles.vSpace}
                        style={{
                          width: 200,
                          height: 200,
                          background: 'black',
                        }}
                      >
                        <Portrait
                          user={me}
                          isEditing
                          isMe
                          isMandadory
                          onChange={this.onChange}
                          values={values}
                          errors={errors}
                          dirty={dirty}
                        />
                      </div>
                      <div {...styles.vSpace}>
                        {!me.username && (
                          <UsernameField
                            user={me}
                            values={values}
                            errors={errors}
                            onChange={this.onChange}
                          />
                        )}
                        <GenderField
                          isMandadory
                          values={values}
                          onChange={this.onChange}
                        />
                        <FieldSet
                          values={values}
                          isEditing={isEditing}
                          errors={errors}
                          dirty={dirty}
                          fields={fields(t, vt)}
                          onChange={this.onChange}
                        />
                      </div>
                    </Section>
                    {error && (
                      <div {...styles.vSpace}>
                        <ErrorMessage error={error} />
                      </div>
                    )}
                    <div {...styles.section}>
                      <Small
                        indent={false}
                        dangerousHTML={vt('info/candidacy/finePrint')}
                      />
                    </div>
                    {!isValid && (
                      <div {...styles.vSpace}>
                        <div {...styles.error}>
                          {vt('info/candidacy/missingFields')}
                          <ul>
                            {Object.keys(combinedErrors).map(
                              (k) =>
                                !!combinedErrors[k] && (
                                  <li key={k}>{combinedErrors[k]}</li>
                                ),
                            )}
                          </ul>
                        </div>
                      </div>
                    )}
                    <div {...styles.vSpace}>
                      {(isEditing || !candidate) && (
                        <div {...styles.saveButton}>
                          {updating ? (
                            <InlineSpinner />
                          ) : (
                            <Button
                              type='submit'
                              block
                              primary
                              onClick={this.save}
                              disabled={updating || !isValid}
                            >
                              {candidate
                                ? vt('info/candidacy/saveChanges')
                                : vt('info/candidacy/sumbitCandidacy')}
                            </Button>
                          )}
                        </div>
                      )}
                      <div {...styles.vSpace}>
                        <Body
                          dangerousHTML={vt('info/footer', {
                            endDate: formatDate(endDate),
                          })}
                        />
                      </div>
                    </div>
                  </Fragment>
                ) : (
                  <>
                    <div {...styles.previewWrapper}>
                      <H2>{vt('info/candidacy/previewTitle')}</H2>
                      <div style={{ margin: `15px 0` }}>
                        <P>{vt('info/candidacy/previewLabel')}</P>
                      </div>
                      <ElectionBallotRow
                        maxVotes={0}
                        expanded
                        candidate={candidacyPreview}
                      />
                    </div>
                    <Fragment>
                      <div {...styles.vSpace}>
                        <Body
                          dangerousHTML={vt('info/candidacy/confirmation')}
                        />
                      </div>
                      <div {...styles.vSpace}>
                        <div {...styles.saveButton}>
                          <Button block primary onClick={this.startEditing}>
                            {vt('info/candidacy/edit')}
                          </Button>
                        </div>
                      </div>
                      {this.props.me.roles.some((r) => r === 'admin') && (
                        <div {...styles.vSpace}>
                          ADMIN TOOL:{' '}
                          <A
                            href='#'
                            onClick={(e) => {
                              e.preventDefault()
                              this.cancel()
                            }}
                          >
                            {vt('info/candidacy/delete')}
                          </A>
                        </div>
                      )}
                    </Fragment>
                  </>
                )}
              </div>
            </>
          )
        }}
      />
    )
  }
}

const cancelCandidacy = gql`
  mutation submitCandidacy($slug: String!) {
    cancelCandidacy(slug: $slug) {
      candidacies {
        id
      }
    }
  }
`

const updateCandidacy = gql`
  mutation updateCandidacy(
    $slug: String!
    $birthday: Date
    $statement: String
    $disclosures: String
    $address: AddressInput
    $portrait: String
    $username: String
    $credential: String!
    $gender: String
    $biography: String
    $publicUrl: String
    $twitterHandle: String
    $facebookId: String
  ) {
    updateMe(
      birthday: $birthday
      statement: $statement
      disclosures: $disclosures
      address: $address
      portrait: $portrait
      username: $username
      gender: $gender
      biography: $biography
      publicUrl: $publicUrl
      twitterHandle: $twitterHandle
      facebookId: $facebookId
      hasPublicProfile: true
    ) {
      id
      username
      name
      portrait
      statement
      disclosures
      birthday
      address {
        name
        line1
        line2
        postalCode
        city
        country
      }
      credentials {
        isListed
        description
      }
      gender
      biography
      biographyContent
      publicUrl
      twitterHandle
      facebookId
    }
    submitCandidacy(slug: $slug, credential: $credential) {
      id
      yearOfBirth
      city
      recommendation
      user {
        id
        candidacies {
          id
          credential {
            id
            description
            verified
          }
          election {
            slug
          }
        }
      }
    }
  }
`

const query = gql`
  query VoteElectionCandidacy($slug: String!) {
    election(slug: $slug) {
      id
      candidacyEndDate
      userIsEligible
    }
    me {
      id
      name
      firstName
      lastName
      username
      portrait
      statement
      disclosures
      birthday
      username
      gender
      biography
      biographyContent
      candidacies {
        election {
          slug
        }
        id
        yearOfBirth
        city
        recommendation
        credential {
          id
          description
          verified
        }
      }
      address {
        name
        line1
        line2
        postalCode
        city
        country
      }
      credentials {
        isListed
        description
      }
      publicUrl
      twitterHandle
      facebookId
    }
  }
`

export default compose(
  withT,
  voteT,
  withRouter,
  withMe,
  graphql(query, {
    options: ({ slug }) => ({
      variables: {
        slug,
      },
    }),
  }),
  graphql(updateCandidacy, {
    props: ({ mutate }) => ({
      updateCandidacy: (variables) => {
        return mutate({
          variables,
        })
      },
    }),
  }),
  graphql(cancelCandidacy, {
    props: ({ mutate }) => ({
      cancelCandidacy: (slug) => {
        return mutate({
          variables: {
            slug,
          },
          refetchQueries: [
            {
              query,
              variables: {
                slug,
              },
            },
          ],
        })
      },
    }),
  }),
)(ElectionCandidacy)
