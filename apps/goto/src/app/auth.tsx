'use client'

import { gql, useLazyQuery, useMutation } from '@apollo/client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const currentMeInQuery = gql`
  query GotoAuthCurrrentMe {
    me {
      id
    }
  }
`

const emailQuery = gql`
  query GotoAuthEmail($token: ID!) {
    me(accessToken: $token) {
      id
      email
    }
  }
`

const signInMutation = gql`
  mutation GotoAuthSignIn($token: ID!, $email: String!) {
    signIn(accessToken: $token, tokenType: ACCESS_TOKEN, email: $email) {
      expiresAt
    }
  }
`

const authorizeSessionMutation = gql`
  mutation GotoAuthAuthorizeSession($token: String!, $email: String!) {
    authorizeSession(
      email: $email
      tokens: [{ type: ACCESS_TOKEN, payload: $token }]
    )
  }
`

type Status =
  | 'pending'
  | 'authorizing'
  | 'authorized'
  | 'not-authorized'
  | 'no-token'

export default function Auth({ children }) {
  const [getCurrentMe] = useLazyQuery(currentMeInQuery)
  const [getEmail] = useLazyQuery(emailQuery)
  const [signIn] = useMutation(signInMutation)
  const [authorizeSession] = useMutation(authorizeSessionMutation)

  const [status, setStatus] = useState<Status>('pending')
  const searchParams = useSearchParams()

  const token = searchParams.get('_goto_token')

  useEffect(() => {
    if (token && status === 'pending') {
      setStatus('authorizing')
    } else if (!token) {
      setStatus('no-token')
    }
  }, [])

  useEffect(() => {
    if (status === 'authorizing') {
      new Promise((resolve) => resolve({ done: false }))
        .then(checkCurrentMe)
        .then(maybeGetEmail)
        .then(maybeSignIn)
        .then(maybeAuthorizeSession)
        .finally(() => null)
    }
  }, [status])

  const checkCurrentMe = ({ done }) => {
    if (done === true) {
      return { done }
    }

    return getCurrentMe().then(({ data }) => {
      if (!data?.me?.id) {
        return { done: false, token }
      }

      return { done: true }
    })
  }

  const maybeGetEmail = ({ done, token }) => {
    if (done === true) {
      return { done }
    }

    return getEmail({ variables: { token } }).then(({ data }) => {
      const email = data?.me?.email

      if (email) {
        return { done: false, token, email }
      }

      return { done: true }
    })
  }

  const maybeSignIn = ({ done, token, email }) => {
    if (done === true) {
      return { done }
    }

    return signIn({ variables: { email, token } }).then(({ data }) => {
      if (data) {
        return { done: false, token, email }
      }

      return { done: true }
    })
  }

  const maybeAuthorizeSession = ({ done, token, email }) => {
    console.debug('maybeAuthorizeSession')

    if (done === true) {
      setStatus('not-authorized')
      return { done }
    }

    return authorizeSession({ variables: { email, token } }).then(
      ({ data }) => {
        if (data?.authorizeSession === true) {
          setStatus('authorized')
        }

        return { done: true }
      },
    )
  }

  if (['pending', 'authorizing'].includes(status)) {
    return (
      <div style={{ padding: 5, border: '1px solid red' }}>
        <p>Debug</p>
        <p style={{ wordBreak: 'break-all' }}>status: {status}</p>
      </div>
    )
  }

  return children
}
