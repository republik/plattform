import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { css } from 'glamor'
import PropTypes from 'prop-types'
import {
  InlineSpinner,
  Button,
  useColorContext,
  A,
} from '@project-r/styleguide'

import { DEFAULT_VALUES } from './Page'

import withT from '../../lib/withT'
import withMe from '../../lib/apollo/withMe'
import { errorToString } from '../../lib/utils/errors'

const styles = {
  container: css({
    marginTop: 15,
    marginBottom: 15,
  }),
  editLink: css({
    display: 'block',
    marginTop: 5,
  }),
}

const EditLink = ({ children, onClick, ...props }) => (
  <A
    href='#edit'
    onClick={(e) => {
      e.preventDefault()
      onClick(e)
    }}
    {...props}
    {...styles.editLink}
  >
    {children}
  </A>
)

const Edit = ({ me, user, t, state, setState, startEditing, update }) => {
  const { isEditing } = state
  const [colorScheme] = useColorContext()

  if (!me || me.id !== user.id) {
    return null
  }
  if (!isEditing) {
    return (
      <div {...styles.container}>
        <EditLink
          onClick={() => {
            startEditing()
          }}
        >
          {t('profile/edit/start')}
        </EditLink>
      </div>
    )
  }
  if (state.updating) {
    return (
      <div {...styles.container}>
        <InlineSpinner />
        <br />
        {t('profile/edit/updating')}
      </div>
    )
  }

  const errorMessages = Object.keys(state.errors)
    .map((key) => state.errors[key])
    .filter(Boolean)

  return (
    <div {...styles.container}>
      {!!state.showErrors && errorMessages.length > 0 && (
        <div
          style={{ marginBottom: 15 }}
          {...colorScheme.set('color', 'error')}
        >
          {t('profile/edit/errors')}
          <br />
          <ul>
            {errorMessages.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      {!!state.error && (
        <div
          style={{ marginBottom: 15 }}
          {...colorScheme.set('color', 'error')}
        >
          {state.error}
        </div>
      )}
      <div
        style={{
          opacity: errorMessages.length ? 0.5 : 1,
        }}
      >
        <Button
          block
          primary
          onClick={() => {
            if (errorMessages.length) {
              setState((state) =>
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
            update({
              ...state.values,
              publicUrl:
                state.values.publicUrl === DEFAULT_VALUES.publicUrl
                  ? ''
                  : state.values.publicUrl,
            })
          }}
        >
          {t(
            state.values.hasPublicProfile && !user.hasPublicProfile
              ? 'profile/edit/publish'
              : 'profile/edit/save',
          )}
        </Button>
      </div>
      <EditLink
        onClick={() => {
          setState({
            isEditing: false,
            values: {},
            errors: {},
          })
        }}
      >
        {t('profile/edit/cancel')}
      </EditLink>
    </div>
  )
}

Edit.propTypes = {
  me: PropTypes.object,
  user: PropTypes.object.isRequired,
  state: PropTypes.object.isRequired,
  setState: PropTypes.func.isRequired,
  startEditing: PropTypes.func.isRequired,
  update: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
}

export const mutation = gql`
  mutation updateMe(
    $username: String
    $hasPublicProfile: Boolean
    $facebookId: String
    $twitterHandle: String
    $emailAccessRole: AccessRole
    $publicUrl: String
    $biography: String
    $statement: String
    $portrait: String
    $phoneNumber: String
    $phoneNumberNote: String
    $phoneNumberAccessRole: AccessRole
    $pgpPublicKey: String
    $isListed: Boolean
    $prolitterisId: String
    $gender: String
  ) {
    updateMe(
      username: $username
      hasPublicProfile: $hasPublicProfile
      facebookId: $facebookId
      twitterHandle: $twitterHandle
      emailAccessRole: $emailAccessRole
      publicUrl: $publicUrl
      biography: $biography
      statement: $statement
      portrait: $portrait
      phoneNumber: $phoneNumber
      phoneNumberNote: $phoneNumberNote
      phoneNumberAccessRole: $phoneNumberAccessRole
      pgpPublicKey: $pgpPublicKey
      isListed: $isListed
      prolitterisId: $prolitterisId
      gender: $gender
    ) {
      id
      username
      hasPublicProfile
      facebookId
      twitterHandle
      emailAccessRole
      publicUrl
      biography
      biographyContent
      statement
      portrait
      phoneNumber
      phoneNumberNote
      phoneNumberAccessRole
      pgpPublicKey
      pgpPublicKeyId
      isListed
      prolitterisId
      gender
      credentials {
        isListed
        description
        verified
      }
    }
  }
`

const publishCredential = gql`
  mutation publishCredential($description: String) {
    publishCredential(description: $description) {
      isListed
      description
    }
  }
`

export default compose(
  graphql(publishCredential, {
    props: ({ mutate, ownProps: { setState } }) => ({
      publishCredential: (description) => {
        return mutate({
          variables: {
            description,
          },
        })
      },
    }),
  }),
  graphql(mutation, {
    props: ({
      mutate,
      ownProps: { setState, publishCredential, user, ...rest },
    }) => ({
      update: async (variables) => {
        setState({ updating: true })

        const credential =
          (user.credentials || []).find((c) => c.isListed) || {}
        if (variables.credential !== credential.description) {
          try {
            await publishCredential(variables.credential || null)
          } catch (error) {
            setState(() => ({
              updating: false,
              error: errorToString(error),
            }))
            return
          }
        }

        return mutate({
          variables,
        })
          .then(() => {
            setState(() => ({
              updating: false,
              isEditing: false,
              error: undefined,
              values: {},
            }))
          })
          .catch((error) => {
            setState(() => ({
              updating: false,
              error: errorToString(error),
            }))
          })
      },
    }),
  }),
  withMe,
  withT,
)(Edit)
