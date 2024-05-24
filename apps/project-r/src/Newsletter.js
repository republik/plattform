import { useState } from 'react'
import { compose } from 'redux'
import { css } from 'glamor'

import isEmail from 'validator/lib/isEmail'

import {
  Button,
  Field,
  InlineSpinner,
  Interaction,
  useColorContext,
} from '@project-r/styleguide'
import { gql } from '@apollo/client'
import { graphql } from '@apollo/client/react/hoc'

const { P } = Interaction

const styles = {
  form: css({
    display: 'flex',
    justifyContent: 'space-between',
    flexFlow: 'row wrap',
  }),
  input: css({
    marginRight: 10,
    marginBottom: 0,
    width: '58%',
    flexGrow: 1,
  }),
  button: css({
    width: 160,
    textAlign: 'center',
    marginBottom: 15,
  }),
  hints: css({
    marginTop: -5,
    fontSize: 16,
    lineHeight: '24px',
  }),
}

const checkEmail = ({ value, shouldValidate }) => ({
  email: value,
  error:
    (value.trim().length <= 0 && 'E-Mail-Adresse fehlt') ||
    (!isEmail(value) && 'E-Mail-Adresse ungültig'),
  dirty: shouldValidate,
})

const errorToString = (error) => {
  if (error.networkError) {
    if (error.toString().match(/failed/i)) {
      return (
        <>
          Die Verbindung zur Republik ist fehlgeschlagen. Bitte prüfen Sie Ihre
          Internetverbindung und versuchen Sie es erneut.
        </>
      )
    }
    return (
      <>
        Bei Ihrer Anfrage ist ein Fehler aufgetreten: «{error.toString()}».
        Erste-Hilfe-Team:{' '}
        <a href='mailto:kontakt@republik.ch'>kontakt@republik.ch</a>.
      </>
    )
  }
  return error.graphQLErrors && error.graphQLErrors.length
    ? error.graphQLErrors.map((e) => e.message).join(', ')
    : error.toString()
}
const ErrorMessage = ({ error, style, children }) => {
  const [colorScheme] = useColorContext()
  return (
    <P style={{ margin: '20px 0', ...style }}>
      <span {...colorScheme.set('color', 'error')}>
        {error && errorToString(error)}
        {children}
      </span>
    </P>
  )
}

const EmailForm = (props) => {
  const { onChange, onSubmit, loading, error, dirty, email, serverError } =
    props

  return (
    <div>
      <form onSubmit={onSubmit}>
        <div {...styles.form}>
          <div {...styles.input}>
            <Field
              name='email'
              type='email'
              label={'E-Mail-Adresse'}
              error={dirty && error}
              onChange={(_, value, shouldValidate) => {
                onChange(
                  checkEmail({
                    value,
                    shouldValidate,
                  }),
                )
              }}
              value={email}
            />
          </div>
          <div {...styles.button}>
            {loading ? (
              <InlineSpinner />
            ) : (
              <Button block type='submit'>
                Anmelden
              </Button>
            )}
          </div>
        </div>
      </form>
      {!!serverError && <ErrorMessage error={serverError} />}
    </div>
  )
}

const Newsletter = ({ requestSubscription }) => {
  const [state, setState] = useState(() => checkEmail({ value: '' }))
  const [serverState, setServerState] = useState({})
  if (serverState.success) {
    return <P>Danke. Jetzt müssen Sie noch Ihre E-Mail-Adresse bestätigen.</P>
  }
  return (
    <EmailForm
      {...state}
      onChange={setState}
      onSubmit={(e) => {
        e.preventDefault()
        if (state.error) {
          setState({ ...state, dirty: true })
          return
        }

        if (state.loading) {
          return
        }
        setServerState({ loading: true })

        requestSubscription({
          variables: { email: state.email },
        })
          .then(() => {
            setServerState({ loading: false, success: true })
          })
          .catch((error) => {
            setServerState({ loading: false, error })
          })
      }}
      loading={serverState.loading}
      serverError={serverState.error}
    />
  )
}

const signUpMutation = gql`
  mutation requestNewsletter($email: String!) {
    requestNewsletterSubscription(
      email: $email
      name: PROJECTR
      context: "newsletter"
    )
  }
`

export default compose(
  graphql(signUpMutation, {
    props: ({ mutate }) => ({
      requestSubscription: mutate,
    }),
  }),
)(Newsletter)
