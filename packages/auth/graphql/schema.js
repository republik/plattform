module.exports = `
schema {
  query: queries
  mutation: mutations
}

type queries {
  me: User
}

type mutations {
  signIn(email: String!): SignInResponse!
  signOut: Boolean!
}
`
