'use client'
import {
  MeDocument,
  SignInDocument,
  SignOutDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { NetworkStatus, useMutation, useQuery } from '@apollo/client'
import { css } from '@republik/theme/css'
import { useSearchParams } from 'next/navigation'
import { useId } from 'react'

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

function WaitForLogin({ phrase }: { phrase: string }) {
  const { data, loading, error, networkStatus } = useQuery(MeDocument, {
    pollInterval: 1000,
    notifyOnNetworkStatusChange: true,
  })

  if (data?.me) {
    return (
      <>
        Logged in! <LogOut />
      </>
    )
  }

  if (error) {
    console.error(error)
  }

  return (
    <>
      <p>
        Check dein Mail: <strong>{phrase}</strong>
      </p>
      <pre>data: {JSON.stringify(data, null, 2)}</pre>
      <pre>loading: {loading ? 'true' : 'false'}</pre>
      <pre>poll: {networkStatus === NetworkStatus.poll ? 'true' : 'false'}</pre>
      <pre>error: {error?.message}</pre>
    </>
  )
}

export function LoginForm() {
  const [signIn, { data, loading, error }] = useMutation(SignInDocument, {})
  const emailId = useId()
  const searchParams = useSearchParams()
  if (data?.signIn) {
    return <WaitForLogin phrase={data.signIn.phrase} />
  }

  if (error) {
    return <div>Ups</div>
  }

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
          const email = (document.getElementById(emailId) as HTMLInputElement)
            ?.value
          if (typeof email === 'string') {
            signIn({
              variables: {
                context: searchParams.get('redirect'),
                email,
              },
            })
          }
        }}
      >
        <label htmlFor={emailId}>E-Mail</label>
        <input name='email' id={emailId} type='email'></input>
        <button disabled={loading} type='submit'>
          Anmelden
        </button>
      </form>
    </div>
  )
}
