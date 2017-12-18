module.exports = `
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
}

type SignInResponse {
  phrase: String!
}
`
