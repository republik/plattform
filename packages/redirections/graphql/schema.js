module.exports = `
schema {
  query: queries
  mutation: mutations
}

type queries {
  redirection(path: String): Redirection
  redirections(
    limit: Int,
    offset: Int
  ): [Redirection!]!
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
