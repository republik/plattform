'use client'
import { type ReactNode, useState } from 'react'

import { useMutation } from '@apollo/client'

import { css } from '@republik/theme/css'
import { vstack } from '@republik/theme/patterns'

import {
  SignInDocument,
  SignInTokenType,
} from '#graphql/republik-api/__generated__/gql/graphql'

import { Button } from '../../ui/button'
import { FormField } from '../../ui/form'

import { CodeForm, CodeFormProps } from './CodeForm'
import { ErrorMessage } from './ErrorMessage'

type SubmitProps = {
  children?: ReactNode
  pending?: boolean
}

export function Submit({ children, pending }: SubmitProps) {
  return (
    <Button
      type='submit'
      disabled={pending}
      loading={pending}
      className={css({
        w: 'full',
      })}
    >
      {children ?? 'Submit'}
    </Button>
  )
}

interface LoginFormProps {
  renderCodeFormHint?: CodeFormProps['renderHint']
  submitButtonText?: string
  context?: string
  autoFocus?: boolean
}

export function LoginForm(props: LoginFormProps) {
  const [signIn, { data, error }] = useMutation(SignInDocument)
  const [email, setEmail] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  if (data?.signIn && email) {
    return <CodeForm email={email} renderHint={props.renderCodeFormHint} />
  }

  const submitEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (pending) {
      return
    }
    setPending(true)

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const email = formData.get('email') as string

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
    }

    setPending(false)
  }

  return (
    <form action='POST' onSubmit={submitEmail}>
      <div
        className={vstack({
          gap: '4',
          alignItems: 'stretch',
          w: 'full',
          maxW: 'lg',
        })}
      >
        {error && <ErrorMessage error={error} />}

        <FormField
          label='E-Mail'
          placeholder='E-mail'
          name='email'
          type='email'
          autoFocus={props.autoFocus}
          hideLabel
        />
        <Submit pending={pending}>{props.submitButtonText}</Submit>
      </div>
    </form>
  )
}
