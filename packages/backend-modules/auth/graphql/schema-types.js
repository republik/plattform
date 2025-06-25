module.exports = `

type Session {
  id: ID!
  ipAddress: String!
  userAgent: String
  email: String!
  expiresAt: DateTime!
  country: String
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
  ACCESS_TOKEN
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
  isApp: Boolean!
  country: String
  city: String
}

type SignInNotification {
  title: String!
  body: String!
  verificationUrl: String!
  expiresAt: DateTime!
}

"Scope of an access token"
enum AccessTokenScope {
  "A token to access me.customPackages (TTL: 90 days)"
  CUSTOM_PLEDGE
  "A token to access me.customPackages (TTL: 120 days)"
  CUSTOM_PLEDGE_EXTENDED
  "A token to use mutation claimCard (TTL: 90 days)"
  CLAIM_CARD
  "A token authorize a session (TTL: 5 days)"
  AUTHORIZE_SESSION
  "A token access a invoices (TTL: 5 days)"
  INVOICE
  "A token to access a users name and portrait (TTL: 30 days)"
  NOW_YOU_SEE_ME
}
`
