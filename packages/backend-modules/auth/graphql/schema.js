module.exports = `
schema {
  query: queries
  mutation: mutations
}

type queries {
  # session wins over access token
  me(accessToken: ID): User

  # check if a username is available
  # also returns true if you already own it
  # ensures signed in
  checkUsername(username: String): Boolean

  # Get a user by slug, username or an access token.
  # If slug is provieded, accessToken is ignored.
  user(
    id: ID
    slug: String
    accessToken: ID
  ): User

  # search for users
  # required role: editor
  users(
    search: String!
    role: String
    isListed: Boolean
    hasPublicProfile: Boolean
  ): [User]!

  # search for an unverified session by token
  unauthorizedSession(email: String!, token: SignInToken!): UnauthorizedSession

  # your latest, pending signIn notification
  pendingAppSignIn: SignInNotification

  # the requesting userAgent
  echo: RequestInfo!
}

type mutations {
  # signIn
  # default tokenType: EMAIL_TOKEN
  signIn(
    email: String!,
    context: String,
    consents: [String!],
    tokenType: SignInTokenType,
    # accessToken w/ scope AUTHORIZE_SESSION
    accessToken: ID
  ): SignInResponse!
  signOut: Boolean!

  # if userId is null, the logged in user's email is changed
  # required role to change other's email: supporter
  updateEmail(userId: ID, email: String!): User!

  # start a second factor challenge
  startChallenge(sessionId: ID!, type: SignInTokenType!): Boolean!

  # authorize a token sent by mail to convert a login request to a valid user session
  authorizeSession(
    email: String!
    tokens: [SignInToken!]!
    consents: [String!]
    requiredFields: RequiredUserFields
  ): Boolean!

  # deny a session via token challenge
  denySession(email: String!, token: SignInToken!): Boolean!

  # if userId is null, this operation will be scoped to the logged in user
  # required role to clear other's session: supporter
  clearSession(sessionId: ID!, userId: ID): Boolean!

  # if userId is null, the logged in user's sessions get cleared
  # required role to clear other's session: supporter
  clearSessions(userId: ID): Boolean!

  # if userId is null, the logged in user is changed
  # required role to change others: supporter
  preferredFirstFactor(userId: ID, tokenType: SignInTokenType): User!

  # Add a user to a given role
  addUserToRole(userId: ID, role: String!): User!

  # Remove a user from a given role
  removeUserFromRole(userId: ID, role: String!): User!

  # roll a users accessKey
  rollAccessKey(userId: ID): User!

  submitConsent(name: String!): User!
  revokeConsent(name: String!): User!
}
`
