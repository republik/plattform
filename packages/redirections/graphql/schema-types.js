module.exports = `

type RedirectionPageInfo {
  hasNextPage: Boolean!
  endCursor: String
  hasPreviousPage: Boolean!
  startCursor: String
}

type RedirectionConnection {
  totalCount: Int!
  pageInfo: RedirectionPageInfo!
  nodes: [Redirection!]!
}

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
