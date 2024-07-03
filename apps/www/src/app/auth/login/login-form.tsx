'use client'
import {
  AuthorizeSessionDocument,
  MeDocument,
  SignInDocument,
  SignInTokenType,
  SignOutDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useMutation, useQuery } from '@apollo/client'
import { css } from '@republik/theme/css'
import { useSearchParams } from 'next/navigation'
import { useId, useState } from 'react'

function LogOut() {
  const [signOut, { loading }] = useMutation(SignOutDocument)

  return (
    <button
      onClick={() => signOut().then(() => window.location.reload())}
      disabled={loading}
    >
      Abmelden
    </button>
  )
}

function useSignIn() {
  const meQuery = useQuery(MeDocument, {
    pollInterval: 2000,
  })

  const [signIn, signInQuery] = useMutation(SignInDocument, {})

  return {
    signIn,
    error: meQuery.error || signInQuery.error,
    loading: meQuery.loading || signInQuery.loading,
    me: meQuery.data?.me,
    data: signInQuery.data?.signIn,
  }
}

function AuthorizeCode({ email }: { email: string }) {
  const [authorizeSession] = useMutation(AuthorizeSessionDocument)
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        const code = (formData.get('code') as string)
          ?.replace(/[^0-9]/g, '')
          .slice(0, 6)

        authorizeSession({
          variables: {
            email,
            tokens: [{ type: SignInTokenType.EmailCode, payload: code }],
          },
        })
      }}
    >
      <input name='code'></input>
      <button type='submit'>OK</button>
    </form>
  )
}

export function LoginForm() {
  const { signIn, me, error, loading, data } = useSignIn()

  const [email, setEmail] = useState('')
  const emailId = useId()
  const searchParams = useSearchParams()

  if (error) {
    return <div>Ups</div>
  }

  if (loading) {
    return <div>Momentchen …</div>
  }

  // Logged in
  if (me) {
    return (
      <>
        Eingeloggt! <LogOut />
      </>
    )
  }

  // Signing in
  if (data) {
    const { tokenType, phrase, alternativeFirstFactors } = data

    if (tokenType === SignInTokenType.EmailCode) {
      return <AuthorizeCode email={email} />
    }

    return (
      <>
        <p>
          Check dein {tokenType}: <strong>{phrase}</strong>
        </p>

        <ul>
          {alternativeFirstFactors.map((altTokenType) => {
            return (
              <form
                key={altTokenType}
                onSubmit={() => {
                  signIn({
                    variables: {
                      email,
                      tokenType: altTokenType,
                    },
                  })
                }}
              >
                <button disabled={loading} type='submit'>
                  ODER {altTokenType}
                </button>
              </form>
            )
          })}
        </ul>
      </>
    )
  }

  // Show login form
  return (
    <div>
      <form
        className={css({
          display: 'flex',
          flexDirection: 'column',
          gap: '6',
        })}
        onSubmit={(e) => {
          e.preventDefault()

          if (typeof email === 'string') {
            signIn({
              variables: {
                context: searchParams.get('redirect'),
                email,
                tokenType: SignInTokenType.EmailCode,
              },
            })
          }
        }}
      >
        <label htmlFor={emailId}>E-Mail</label>
        <input
          name='email'
          id={emailId}
          type='email'
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
        ></input>
        <button disabled={loading} type='submit'>
          Anmelden
        </button>
      </form>
    </div>
  )
}
