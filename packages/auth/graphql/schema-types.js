module.exports = `

type Session {
  id: ID!
  ipAddress: String!
  userAgent: String
  email: String!
  expiresAt: DateTime!
  country: String
  countryFlag: String
  city: String
  isCurrent: Boolean!
}

type UnauthorizedSession {
  session: Session!
  availableSecondFactorTokenTypes: [SignInTokenType]!
}

type User {
  id: ID!
  initials: String
  username: String
  name: String
  firstName: String
  lastName: String
  email: String
  hasPublicProfile: Boolean
  roles: [String!]!
  createdAt: DateTime!
  updatedAt: DateTime!
  sessions: [Session!]
  enabledSecondFactorTokenTypes: [SignInTokenType]!
}

type SignInResponse {
  phrase: String!
}

type SharedSecretResponse {
  secret: String!
  otpAuthUrl: String!
  svg(ecLevel: String = "M"): String!
}

enum SignInTokenType {
  EMAIL_TOKEN
  TOTP
  SMS
}

input SignInToken {
  type: SignInTokenType!
  payload: String!
}

type RequestInfo {
  ipAddress: String!
  userAgent: String
  country: String
  countryFlag: String
  city: String
}
`
