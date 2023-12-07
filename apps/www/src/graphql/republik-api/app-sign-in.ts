import { gql } from './gql'

export const PENDING_APP_SIGN_IN_QUERY = gql(`
  query PendingAppSignIn {
    pendingAppSignIn {
      title
      body
      verificationUrl
      expiresAt
    }
  }
`)

export type SignInTokenType =
  | 'EMAIL_TOKEN'
  | 'EMAIL_CODE'
  | 'ACCESS_TOKEN'
  | 'TOTP'
  | 'SMS'
  | 'APP'
