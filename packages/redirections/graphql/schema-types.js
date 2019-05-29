module.exports = `
type Redirection {
  id: ID!
  source: String!
  target: String!
  status: Int!
  resource: JSON
  keepQuery: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}
`
