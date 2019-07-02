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
  phrase: String
}

type UnauthorizedSession {
  session: Session!
  enabledSecondFactors: [SignInTokenType]!
  requiredConsents: [String!]!
  requiredFields: [String!]!
  newUser: Boolean
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
  deletedAt: DateTime
  sessions: [Session!]
  # in order of preference
  enabledFirstFactors: [SignInTokenType!]!
  preferredFirstFactor: SignInTokenType
  enabledSecondFactors: [SignInTokenType!]!
  eventLog: [EventLog!]!
  # is this the user of the requesting session
  isUserOfCurrentSession: Boolean!
  # get an access token
  # exclusively accessible by the user herself
  accessToken(scope: AccessTokenScope!): ID
  # null: undecided
  # true: consented
  # false: consent revoked
  hasConsentedTo(name: String!): Boolean
}

type SignInResponse {
  phrase: String!
  tokenType: SignInTokenType!
  expiresAt: DateTime!
  alternativeFirstFactors: [SignInTokenType!]!
}

type SharedSecretResponse {
  secret: String!
  otpAuthUrl: String!
  svg(errorCorrectionLevel: QRCodeErrorCorrectionLevel = M): String!
}

# Error Correction Level for QR Images
# http://qrcode.meetheed.com/question17.php
enum QRCodeErrorCorrectionLevel {
  L
  M
  Q
  H
}

enum SignInTokenType {
  EMAIL_TOKEN
  EMAIL_CODE
  TOTP
  SMS
  APP
}

input SignInToken {
  type: SignInTokenType!
  payload: String!
}

input RequiredUserFields {
  firstName: String!
  lastName: String!
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

type SignInNotification {
  title: String!
  body: String!
  verificationUrl: String!
  expiresAt: DateTime!
}

enum AccessTokenScope {
  CUSTOM_PLEDGE
}
`
