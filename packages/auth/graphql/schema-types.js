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
  eventLog: [EventLog!]!
}

type SignInResponse {
  phrase: String!
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
