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

const DefaultMessage = <>Automatische Anmeldung…</>

type AuthorizeProps = {
  message?: React.ReactNode
  children: React.ReactNode
}

export default function Authorize(props: AuthorizeProps) {
  const { message = DefaultMessage, children } = props

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
      new Promise((resolve) => resolve({ done: false, token }))
        .then(checkCurrentMe)
        .then(maybeGetEmail)
        .then(maybeSignIn)
        .then(maybeAuthorizeSession)
        .catch(authorizeError)
    }
  }, [status])

  const checkCurrentMe = ({ done, token }) => {
    if (done === true) {
      console.debug('checkCurrentMe', 'skipping, done is', done)
      console.warn('checkCurrentMe', 'done should not be', done)
      return { done }
    }

    return getCurrentMe().then(({ data }) => {
      if (!data?.me?.id) {
        console.debug('checkCurrentMe', 'continue, me.id is falsy')
        return { done: false, token }
      }

      console.debug('checkCurrentMe', 'done, me.id present')
      return { done: true }
    })
  }

  const maybeGetEmail = ({ done, token }) => {
    if (done === true) {
      console.debug('maybeGetEmail', 'skipping, done is', done)
      return { done }
    }

    return getEmail({ variables: { token } }).then(({ data }) => {
      const email = data?.me?.email

      if (email) {
        console.debug(
          'maybeGetEmail',
          'continue, token resulted in email:',
          email,
        )
        return { done: false, token, email }
      }

      console.debug('maybeGetEmail', 'done, token resulted in no email')
      return { done: true }
    })
  }

  const maybeSignIn = ({ done, token, email }) => {
    if (done === true) {
      console.debug('maybeSignIn', 'skipping, done is', done)
      return { done }
    }

    return signIn({ variables: { email, token } }).then(({ data }) => {
      if (data) {
        console.debug(
          'maybeSignIn',
          'not done, signIn created (unauthorized) session',
        )
        return { done: false, token, email }
      }

      console.debug('maybeSignIn', 'done since signIn failed')
      return { done: true }
    })
  }

  const maybeAuthorizeSession = ({ done, token, email }) => {
    if (done === true) {
      console.debug('maybeAuthorizeSession', 'set status to "not-authorized"')
      setStatus('not-authorized')
      return { done }
    }

    return authorizeSession({ variables: { email, token } }).then(
      ({ data }) => {
        if (data?.authorizeSession === true) {
          console.debug('maybeAuthorizeSession', 'session authorized')
          setStatus('authorized')
        }

        return { done: true }
      },
    )
  }

  const authorizeError = (e) => {
    setStatus('not-authorized')
    console.warn('authorizeError', 'unable to authorize', e)
  }

  if (['pending', 'authorizing'].includes(status)) {
    return message
  }

  return children
}
