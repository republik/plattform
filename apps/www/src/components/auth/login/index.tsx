'use client'

import {
  SignInDocument,
  SignInTokenType,
} from '#graphql/republik-api/__generated__/gql/graphql'

import { ApolloError, useMutation } from '@apollo/client'

import { useTrackEvent } from '@app/lib/analytics/event-tracking'

import { vstack } from '@republik/theme/patterns'

import { useTranslation } from 'lib/withT'
import { type ReactNode, useState } from 'react'
import isEmail from 'validator/lib/isEmail'

import { Button } from '../../ui/button'
import { FormField } from '../../ui/form'

import { CodeForm } from './code-form'
import { ErrorMessage } from './error-message'
import { Tos } from './tos'
import { SignupContextType } from './utils'

type SubmitProps = {
  children?: ReactNode
  pending?: boolean
}

export function Submit({ children, pending }: SubmitProps) {
  return (
    <Button type='submit' size='full' disabled={pending} loading={pending}>
      {children ?? 'Weiter'}
    </Button>
  )
}

function ResetButton({ onClick }) {
  const { t } = useTranslation()
  return (
    <Button type='button' variant='link' onClick={onClick}>
      {t('loginPopup/resetButton')}
    </Button>
  )
}

interface LoginFormProps {
  submitButtonText?: string
  context?: SignupContextType
  analyticsProps: Record<string, string>
  autoFocus?: boolean
  renderBefore?: ReactNode
  renderAfter?: ReactNode
  redirectUrl?: string
  defaultEmail?: string
}

export function LoginForm(props: LoginFormProps) {
  const { t } = useTranslation()
  const [signIn, signInRes] = useMutation(SignInDocument)
  const trackEvent = useTrackEvent()

  const [defaultEmail, setDefaultEmail] = useState(props.defaultEmail ?? '')
  const [autoFocus, setAutoFocus] = useState(props.autoFocus ?? false)
  const [email, setEmail] = useState<string | null>(null)
  const [error, setError] = useState<ApolloError | string | undefined>()
  const [showTos, setShowTos] = useState(props.autoFocus ?? false)
  const [pending, setPending] = useState(false)

  const isFirstLogin = props.context === 'trial' // could be extended to registration scenarios

  if (signInRes.data?.signIn && email) {
    return (
      <CodeForm
        email={email}
        context={props.context}
        analyticsProps={props.analyticsProps}
        redirectUrl={props.redirectUrl}
      />
    )
  }

  const submitEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (pending) {
      return
    }
    setShowTos(true)
    setPending(true)

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const email = formData.get('email') as string

    if (!email || !isEmail(email)) {
      setPending(false)
      setError(t('auth/login/email/missing'))
      return
    }

    const result = await signIn({
      variables: {
        email: email,
        context: props.context,
        consents: ['PRIVACY'],
        tokenType: SignInTokenType.EmailCode,
      },
    })

    if (result.data?.signIn) {
      setEmail(email)
      trackEvent({
        action: 'Initiated login',
        ...props.analyticsProps,
      })
    }

    if (result.errors && result.errors.length > 0) {
      setError(new ApolloError({ graphQLErrors: result.errors }))
    }

    setPending(false)
  }

  return (
    <form
      action='POST'
      onSubmit={submitEmail}
      key={defaultEmail ?? 'email-submit'}
    >
      {props.renderBefore}
      <div
        className={vstack({
          gap: '4',
          alignItems: 'stretch',
          w: 'full',
          maxW: 'lg',
          '& a': {
            textDecoration: 'underline',
          },
        })}
      >
        <FormField
          label='Ihre E-Mail-Adresse'
          defaultValue={defaultEmail ?? undefined}
          name='email'
          type='email'
          autoFocus={autoFocus}
          onFocus={() => setShowTos(true)}
          description={
            defaultEmail && (
              <ResetButton
                onClick={() => {
                  setDefaultEmail('')
                  setAutoFocus(true)
                }}
              />
            )
          }
        />
        {error && <ErrorMessage error={error} />}
        {isFirstLogin && showTos && <Tos />}
        <Submit pending={pending}>{props.submitButtonText}</Submit>
      </div>
      {props.renderAfter}
    </form>
  )
}
