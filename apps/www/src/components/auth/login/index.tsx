'use client'
import { type ReactNode, useState } from 'react'

import { ApolloError, useMutation } from '@apollo/client'

import { vstack } from '@republik/theme/patterns'

import { useTrackEvent } from '@app/lib/analytics/event-tracking'

import {
  SignInDocument,
  SignInTokenType,
} from '#graphql/republik-api/__generated__/gql/graphql'

import { useTranslation } from 'lib/withT'
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
      {children ?? 'Submit'}
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
}

export function LoginForm(props: LoginFormProps) {
  const [signIn, signInRes] = useMutation(SignInDocument)
  const trackEvent = useTrackEvent()
  const [email, setEmail] = useState<string | null>(null)
  const [error, setError] = useState<ApolloError | string | undefined>()
  const [showTos, setShowTos] = useState(props.autoFocus ?? false)
  const [pending, setPending] = useState(false)
  const { t } = useTranslation()

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
        action: 'Initiated trial registration',
        ...props.analyticsProps,
      })
    }

    if (result.errors && result.errors.length > 0) {
      setError(new ApolloError({ graphQLErrors: result.errors }))
    }

    setPending(false)
  }

  return (
    <form action='POST' onSubmit={submitEmail}>
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
          label='E-Mail-Adresse'
          name='email'
          type='email'
          autoFocus={props.autoFocus}
          onFocus={() => setShowTos(true)}
        />
        {error && <ErrorMessage error={error} />}
        {showTos && <Tos />}
        <Submit pending={pending}>{props.submitButtonText}</Submit>
      </div>
      {props.renderAfter}
    </form>
  )
}
