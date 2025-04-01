'use client'
import { type ReactNode, useId, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'

import {
  AuthorizeSessionDocument,
  SignInDocument,
  SignInTokenType,
} from '#graphql/republik-api/__generated__/gql/graphql'

import { css } from '@republik/theme/css'
import { visuallyHidden, vstack } from '@republik/theme/patterns'

import { Alert, AlertDescription, AlertTitle } from '../../ui/alert'
import { Button } from '../../ui/button'
import { FormField } from '../../ui/form'
import { Spinner } from '../../ui/spinner'

import { CodeInput } from './code-input'
import { ApolloError, useApolloClient, useMutation } from '@apollo/client'

const ErrorMessage = ({
  error,
}: {
  error: string | ApolloError | undefined
}) => {
  const message =
    typeof error === 'string'
      ? error
      : error?.networkError
      ? 'Network error'
      : error?.graphQLErrors[0]?.message

  return (
    <Alert variant='error'>
      <AlertTitle>Error</AlertTitle>
      {message && <AlertDescription>{message}</AlertDescription>}
    </Alert>
  )
}

type SubmitProps = {
  children?: ReactNode
}

export function Submit({ children }: SubmitProps) {
  const { pending } = useFormStatus()
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
  loginFormHeader?: ReactNode
  loginFormInfo?: ReactNode
  renderCodeFormHint?: CodeFormProps['renderHint']
  submitButtonText?: string
}

export function LoginForm(props: LoginFormProps) {
  const [signIn, { data, error }] = useMutation(SignInDocument)
  const [email, setEmail] = useState<string | null>(null)

  if (data?.signIn && email) {
    return <CodeForm email={email} renderHint={props.renderCodeFormHint} />
  }

  return (
    <form
      action={async (formData) => {
        const email = formData.get('email') as string
        const result = await signIn({
          variables: {
            email: email,
            tokenType: SignInTokenType.EmailCode,
          },
        })
        if (result.data?.signIn) {
          setEmail(email)
        }
      }}
    >
      <div
        className={vstack({
          gap: '4',
          alignItems: 'stretch',
          w: 'full',
          maxW: 'lg',
        })}
      >
        {props.loginFormHeader}
        {error && <ErrorMessage error={error} />}

        <FormField label='E-Mail' name='email' type='email' autoFocus />

        {props.loginFormInfo}
        <Submit>{props.submitButtonText}</Submit>
      </div>
    </form>
  )
}

interface CodeFormProps {
  email: string
  renderHint?: (email: string) => ReactNode
}

function CodeForm({ email, renderHint }: CodeFormProps) {
  const codeId = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState<ApolloError | undefined>()
  const [pending, setPending] = useState(false)

  const gql = useApolloClient()

  const handleSubmit = async (formData: FormData) => {
    if (pending) {
      return
    }

    const email = formData.get('email') as string
    const code = (formData.get('code') as string)?.replace(/[^0-9]/g, '')
    const token = { type: SignInTokenType.EmailCode, payload: code }

    setPending(true)

    const autorizedRes = await gql.mutate({
      mutation: AuthorizeSessionDocument,
      variables: {
        email,
        tokens: [token],
        consents: ['PRIVACY'],
      },
    })

    if (autorizedRes.errors && autorizedRes.errors.length > 0) {
      setError(new ApolloError({ graphQLErrors: autorizedRes.errors }))
      setPending(false)
      return
    }

    if (autorizedRes.data?.authorizeSession) {
      setTimeout(() => {
        window.location.reload()
      }, 200)
    }
  }

  return (
    <form action={handleSubmit} ref={formRef}>
      <div
        className={vstack({
          gap: '4',
          alignItems: 'stretch',
          w: 'full',
          maxW: 'lg',
        })}
      >
        {renderHint?.(email)}
        {error && <ErrorMessage error={error} />}
        <input name='email' type='hidden' value={email} readOnly></input>

        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '4',
            mt: '4',
          })}
        >
          <label htmlFor={codeId} className={visuallyHidden()}>
            Code
          </label>
          <CodeInput
            id={codeId}
            name='code'
            disabled={pending}
            inputMode='numeric'
            autoFocus
            onComplete={() => {
              // Safari < 16 doesn't support requestSubmit(), so we submit manually
              // formRef.current?.requestSubmit?.();
              if (formRef.current && !pending) {
                handleSubmit(new FormData(formRef.current))
              }
            }}
          />
          <div
            // style={{ visibility: pending ? "visible" : "hidden" }}
            className={css({
              display: 'flex',
              alignItems: 'center',
              color: 'text.secondary',
              fontSize: 'sm',
              textAlign: 'center',
            })}
          >
            {pending ? (
              <>
                <span>checking code</span> <Spinner />
              </>
            ) : (
              <>
                <span>
                  <button
                    type='button' // Important, so this button isn't used to submit the form
                    onClick={() => window.location.reload()}
                    className={css({
                      textDecoration: 'underline',
                      display: 'inline-block',
                    })}
                  >
                    send to another email adress
                  </button>
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}
