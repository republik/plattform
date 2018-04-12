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
  eventLog: [EventLog!]!
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

enum EventLogType {
  TOKEN_REQUEST
  TOKEN_RE_REQUEST
  ROLL_SESSION
  AUTHORIZE_SESSION
  DENY_SESSION
  SIGNOUT_TIMEOUT
  UNKNOWN
}

type EventLog {
  type: EventLogType
  archivedSession: Session
  activeSession: Session
  createdAt: DateTime!
}
`
