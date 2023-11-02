'use client'

import { useMutation } from '@apollo/client'
import {
  AUTHORIZE_SESSION_MUTATION,
  AuthorizeSessionResult,
  AuthorizeSessionVariables,
  DENY_SESSION_MUTATION,
  DenySessionResult,
  DenySessionVariables,
  SignInTokenType,
} from '@app/graphql/republik-api/app-sign-in'
import { css } from '@app/styled-system/css'
import { ReactNode, useState } from 'react'

type AppSignInViewProps = {
  children?: ReactNode
  email: string
  token: string
  tokenType: SignInTokenType
}

export function AppSignInView({ ...props }: AppSignInViewProps) {
  const [hide, setHide] = useState(false)
  const [authorizeSession] = useMutation<
    AuthorizeSessionResult,
    AuthorizeSessionVariables
  >(AUTHORIZE_SESSION_MUTATION)
  const [denySession] = useMutation<DenySessionResult, DenySessionVariables>(
    DENY_SESSION_MUTATION,
  )

  async function onAuthorize() {
    authorizeSession({
      variables: {
        email: props.email,
        tokens: [{ payload: props.token, type: props.tokenType }],
      },
    })
    setHide(true)
  }

  async function onDeny() {
    denySession({
      variables: {
        email: props.email,
        token: { payload: props.token, type: props.tokenType },
      },
    })
    setHide(true)
    // TODO: handle error
  }

  if (hide) {
    return null
  }

  return (
    <div
      className={css({
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        padding: '1rem',
        backgroundColor: 'white',
        color: 'black',
        border: '1px solid black',
        overflow: 'scroll',
      })}
    >
      <div
        className={css({
          color: 'red',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          '& button': {
            backgroundColor: 'red',
            color: 'white',
          },
        })}
      >
        <button onClick={() => onAuthorize()}>accept</button>
        <button onClick={() => onDeny()}>deny</button>
      </div>
      {props.children}
    </div>
  )
}
