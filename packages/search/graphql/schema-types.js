module.exports = `

scalar Date

enum OrderDirection {
  ASC
  DESC
}

enum SearchSortKey {
  relevance
  publishedAt
  # TODO
  mostRead
  # TODO
  mostDebated
}

input SearchSortInput {
  key: SearchSortKey!
  direction: OrderDirection
}

input DateRangeInput {
  from: Date
  to: Date
}

input SearchFiltersInput {
  feed: Boolean
  dossier: String
  format: String
  template: String
  userId: ID
  publishedAt: DateRangeInput
  author: String
  seriesMaster: String
  discussion: Boolean
  audio: Boolean
}

type SearchConnection {
  nodes: [SearchNode!]!
  stats: SearchStats!
  pageInfo: SearchPageInfo!
}

type SearchPageInfo {
  hasNextPage: Boolean!
  endCursor: String
  hasPreviousPage: Boolean!
  startCursor: String
}

type SearchNode {
  node: SearchNode!
  highlights: [String!]!
  score: Float!
}

union SearchNode = Document | Comment

type SearchStats {
  total: Int!
  authors: SearchAggregation!
  audio: Int!
  dossiers: SearchAggregation!
  formats: SearchAggregation!
  seriesMasters: SearchAggregation!
  discussions: Int!
}

type SearchAggregation {
  buckets: [Bucket!]!
}

type Bucket {
  key: String!
  count: Int!
}
`
