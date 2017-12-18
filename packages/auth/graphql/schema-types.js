module.exports = `
type User {
  id: ID!
  username: String
  name: String
  firstName: String
  lastName: String
  email: String
  roles: [String!]!
}

type SignInResponse {
  phrase: String!
}
`
