module.exports = `
schema {
  query: queries
  mutation: mutations
}

type queries {
  me: User

  # search for users
  # required role: editor
  users(search: String!, role: String!): [User]!
}

type mutations {
  # signIn with an email address
  # context is deprecated
  signIn(email: String!, context: String @deprecated): SignInResponse!
  signOut: Boolean!
}
`
