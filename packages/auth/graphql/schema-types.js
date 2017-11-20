module.exports = `
type User {
  id: ID!
  name: String
  firstName: String
  lastName: String
  email: String!
  roles: [String]!
}

type SignInResponse {
  phrase: String!
}
`
