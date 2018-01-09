module.exports = `
schema {
  query: queries
  mutation: mutations
}

type queries {
  me: User

  # check if a username is available
  # also returns true if you already own it
  # ensures signed in
  checkUsername(username: String): Boolean

  # get user by slug—a id or username
  # only returns users with a public profile
  user(slug: String): User
  # search for users
  # required role: editor
  users(search: String!, role: String!): [User]!

  # search for an unverified session by token
  unauthorizedSession(email: String!, token: String!): Session
}

type mutations {
  # signIn with an email address
  signIn(email: String!, context: String): SignInResponse!
  signOut: Boolean!

  # authorize a token sent by mail to convert a login request to a valid user session
  authorizeSession(email: String!, token: String!): Boolean!

  # Clear a specific session. If there is no userId provided,
  # the system defaults to the logged in user
  clearSession(sessionId: ID!, userId: ID): Boolean!

  # Sign out a user on all devices. If there is no userId provided,
  # the system defaults to the logged in user
  clearSessions(userId: ID): Boolean!
}
`
