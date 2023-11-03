import { gql } from '@apollo/client'

export const PENDING_APP_SIGN_IN_QUERY = gql`
  query PendingAppSignIn {
    pendingAppSignIn {
      title
      body
      verificationUrl
      expiresAt
    }
  }
`
export type PendingAppSignInResult = {
  pendingAppSignIn: null | {
    title: string
    body: string
    verificationUrl: string
    expiresAt: string // ISO date
  }
}

export type SignInTokenType =
  | 'EMAIL_TOKEN'
  | 'EMAIL_CODE'
  | 'ACCESS_TOKEN'
  | 'TOTP'
  | 'SMS'
  | 'APP'
