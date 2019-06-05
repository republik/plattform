module.exports = `
schema {
  query: queries
  mutation: mutations
}

type queries {
  redirection(path: String): Redirection
  redirections(
    first: Int
    last: Int
    before: String
    after: String
  ): RedirectionConnection!
}

type mutations {
  addRedirection(
    source: String!
    target: String!
    status: Int!
    keepQuery: Boolean
    resource: JSON
  ): Redirection!

  updateRedirection(
    id: ID!
    source: String
    target: String
    status: Int
    keepQuery: Boolean
    resource: JSON
  ): Redirection!

  deleteRedirection(id: ID!): Boolean!
}
`
