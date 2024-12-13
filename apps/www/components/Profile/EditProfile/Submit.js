import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { css } from 'glamor'
import Link from 'next/link'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import {
  InlineSpinner,
  Button,
  useColorContext,
  A,
} from '@project-r/styleguide'

const DEFAULT_VALUES = {
  publicUrl: 'https://',
}

import { updateMe } from '../graphql/updatedMe'
import withT from '../../../lib/withT'
import withMe from '../../../lib/apollo/withMe'
import { errorToString } from '../../../lib/utils/errors'

const styles = {
  container: css({
    marginTop: 15,
    marginBottom: 15,
  }),
}

const Submit = ({ me, user, t, state, setState, update }) => {
  const [colorScheme] = useColorContext()
  const router = useRouter()

  if (!me || me.id !== user.id) {
    return null
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
          marginBottom: 8,
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
            }).then(() => router.push(`/~${user.slug}`))
          }}
        >
          {state.updating ? <InlineSpinner /> : <>{t('profile/edit/save')}</>}
        </Button>
      </div>
      <Link
        href={{
          pathname: `/~${user.slug}`,
        }}
      >
        abbrechen
      </Link>
    </div>
  )
}

Submit.propTypes = {
  me: PropTypes.object,
  user: PropTypes.object.isRequired,
  state: PropTypes.object.isRequired,
  setState: PropTypes.func.isRequired,
  startEditing: PropTypes.func.isRequired,
  update: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
}

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
  graphql(updateMe, {
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
)(Submit)
