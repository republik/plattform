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
  signIn(email: String!): SignInResponse!
  signOut: Boolean!
}
`
