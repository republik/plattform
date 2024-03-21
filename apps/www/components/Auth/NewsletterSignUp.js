import { useState } from 'react'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'

import withMe from '../../lib/apollo/withMe'
import withT from '../../lib/withT'

import NewsletterSubscriptions from '../Account/NewsletterSubscriptions'
import EmailForm, { checkEmail } from './EmailForm'

import { Interaction } from '@project-r/styleguide'
import { useTrackEvent } from '@app/lib/matomo/event-tracking'

const SignUp = ({
  me,
  name,
  buttonLabel,
  free,
  t,
  requestSubscription,
  context = 'newsletter',
  showTitle,
  showDescription,
  smallButton,
}) => {
  const [state, setState] = useState(() => checkEmail({ value: '', t }))
  const [serverState, setServerState] = useState({})
  const trackEvent = useTrackEvent()

  return (
    <>
      {showTitle && (
        <Interaction.H3 style={{ marginBottom: 8 }}>
          {t(`account/newsletterSubscriptions/${name}/label`)}
        </Interaction.H3>
      )}
      {showDescription && (
        <Interaction.P style={{ marginBottom: 12 }}>
          {t(`account/newsletterSubscriptions/${name}/description`)}
        </Interaction.P>
      )}
      {me || !free ? (
        <NewsletterSubscriptions
          free={free}
          onlyName={name}
          smallButton={smallButton}
          onSubscribe={() => {
            trackEvent({
              action: 'subscribeNewsletterMember',
            })
          }}
        />
      ) : serverState.success ? (
        <Interaction.P>{t('Auth/NewsletterSignUp/success')}</Interaction.P>
      ) : (
        <EmailForm
          {...state}
          label={buttonLabel || t('Auth/NewsletterSignUp/submit')}
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
              variables: {
                name,
                email: state.email,
                context,
              },
            })
              .then(() => {
                setServerState({ loading: false, success: true })
                trackEvent({ action: 'newsletterSignupEmail' })
              })
              .catch((error) => {
                setServerState({ loading: false, error })
              })
          }}
          loading={serverState.loading}
          serverError={serverState.error}
          smallButton={smallButton}
        />
      )}
    </>
  )
}

const signUpMutation = gql`
  mutation requestNewsletter(
    $email: String!
    $name: NewsletterName!
    $context: String!
  ) {
    requestNewsletterSubscription(email: $email, name: $name, context: $context)
  }
`

export default compose(
  withT,
  withMe,
  graphql(signUpMutation, {
    props: ({ mutate }) => ({
      requestSubscription: mutate,
    }),
  }),
)(SignUp)
