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

export const UNAUTHORIZED_SESSION_QUERY = gql`
  query UnauthorizedSession(
    $email: String!
    $token: String!
    $tokenType: SignInTokenType!
  ) {
    echo {
      ipAddress
      userAgent
      country
      city
    }
    target: unauthorizedSession(
      email: $email
      token: { type: $tokenType, payload: $token }
    ) {
      newUser
      enabledSecondFactors
      requiredConsents
      requiredFields
      session {
        ipAddress
        userAgent
        country
        city
        phrase
        isCurrent
      }
    }
  }
`

export type SignInTokenType =
  | 'EMAIL_TOKEN'
  | 'EMAIL_CODE'
  | 'ACCESS_TOKEN'
  | 'TOTP'
  | 'SMS'
  | 'APP'
