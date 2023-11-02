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

export type UnauthorizedSessionResult = {
  echo: {
    ipAddress: string
    userAgent: string
    country: string
    city: string
  }
  target: null | {
    newUser: boolean | null
    enabledSecondFactors: SignInTokenType[]
    requiredConsents: string[]
    requiredFields: string[]
    session: {
      ipAddress: string
      userAgent: string | null
      country: string | null
      city: string | null
      phrase: string | null
      isCurrent: boolean
    }
  }
}

export type unauthorizedSessionVariables = {
  email: string
  token: string
  tokenType: SignInTokenType
}

export const DENY_SESSION_MUTATION = gql`
  mutation DenySession($email: String!, $token: SignInToken!) {
    denySession(email: $email, token: $token)
  }
`

export type DenySessionResult = {
  denySession: boolean
}

export type DenySessionVariables = {
  email: string
  token: {
    type: SignInTokenType
    payload: string
  }
}

export const AUTHORIZE_SESSION_MUTATION = gql`
  mutation authorizeSession(
    $email: String!
    $tokens: [SignInToken!]!
    $consents: [String!]
    $requiredFields: RequiredUserFields
  ) {
    authorizeSession(
      email: $email
      tokens: $tokens
      consents: $consents
      requiredFields: $requiredFields
    )
  }
`
export type AuthorizeSessionResult = {
  authorizeSession: boolean
}

export type AuthorizeSessionVariables = {
  email: string
  tokens: {
    type: SignInTokenType
    payload: string
  }[]
  consents?: string[]
  requiredFields?: {
    firstName?: string
    lastName?: string
  }
}
