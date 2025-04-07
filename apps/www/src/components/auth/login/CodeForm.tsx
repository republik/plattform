'use client'

import { type ReactNode, useEffect, useId, useRef, useState } from 'react'

import { ApolloError, useApolloClient } from '@apollo/client'

import { visuallyHidden, vstack } from '@republik/theme/patterns'
import { css } from '@republik/theme/css'

import {
  AuthorizeSessionDocument,
  SignInTokenType,
} from '#graphql/republik-api/__generated__/gql/graphql'

import { Spinner } from '../../ui/spinner'

import { CodeInput } from './CodeInput'
import { ErrorMessage } from './ErrorMessage'
import { reloadPage } from './utils'

export interface CodeFormProps {
  email: string
}

export function CodeForm({ email }: CodeFormProps) {
  const codeId = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState<ApolloError | undefined>()
  const [pending, setPending] = useState(false)

  const gql = useApolloClient()

  useEffect(() => {
    if (formRef.current) {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [])

  const submitForm = async (formData: FormData) => {
    const email = formData.get('email') as string
    const code = (formData.get('code') as string)?.replace(/[^0-9]/g, '')
    const token = { type: SignInTokenType.EmailCode, payload: code }

    setPending(true)

    const autorizedRes = await gql.mutate({
      mutation: AuthorizeSessionDocument,
      variables: {
        email,
        tokens: [token],
      },
    })

    if (autorizedRes.errors && autorizedRes.errors.length > 0) {
      setError(new ApolloError({ graphQLErrors: autorizedRes.errors }))
      setPending(false)
      return
    }

    if (autorizedRes.data?.authorizeSession) {
      reloadPage()
    }
  }

  const submitCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (pending) {
      return
    }

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    submitForm(formData)
  }

  return (
    <form action='POST' onSubmit={submitCode} ref={formRef}>
      <div
        className={vstack({
          gap: '4',
          alignItems: 'stretch ',
          w: 'full',
          maxW: 'lg',
          textAlign: 'center',
        })}
      >
        <h2 className={css({ textStyle: 'h2Sans' })}>
          Wir haben Ihnen einen Zugangscode geschickt
        </h2>
        <div className={css({ textStyle: 'airy' })}>
          <p>
            Geben Sie den 6-stelligen Code ein, den Sie via{' '}
            <b className={css({ fontWeight: 500 })}>{email}</b> erhalten haben.
          </p>
        </div>

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
                submitForm(new FormData(formRef.current))
              }
            }}
          />
          {error && <ErrorMessage error={error} />}
          <div
            // style={{ visibility: pending ? "visible" : "hidden" }}
            className={css({
              mt: '4',
              display: 'flex',
              alignItems: 'center',
              color: 'textSoft',
            })}
          >
            {pending ? (
              <>
                <Spinner />
                <b className={css({ fontWeight: 500, pl: '4' })}>
                  Wir überprüfen Ihren Code…
                </b>
              </>
            ) : (
              <span
                className={css({
                  fontSize: 's',
                  textAlign: 'center',
                  lineHeight: 1.4,
                })}
              >
                Sie können Ihren Code nicht finden? Überprüfen Sie Ihren
                Spam-Ordner oder{' '}
                <button
                  type='button' // Important, so this button isn't used to submit the form
                  onClick={() => window.location.reload()}
                  className={css({
                    textDecoration: 'underline',
                    display: 'inline-block',
                  })}
                >
                  ändern Sie Ihre E-Mail-Adresse
                </button>
                .
              </span>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}
