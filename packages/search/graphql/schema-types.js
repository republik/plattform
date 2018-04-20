module.exports = `

scalar DateTime
scalar JSON

enum OrderDirection {
  ASC
  DESC
}

enum DocumentsSortKey {
  relevance
  publishedAt
  # TODO
  mostRead
  # TODO
  mostDebated
}

input DocumentsSortInput {
  key: DocumentsSortKey!
  direction: OrderDirection
}

input DateRangeInput {
  from: Date
  to: Date
}

input DocumentSearchFiltersInput {
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

type DocumentSearchConnection {
  nodes: [DocumentSearchNode!]!
  stats: DocumentSearchStats!
  pageInfo: DocumentPageInfo!
}

type DocumentSearchNode {
  document: Document!
  highlights: [String!]!
  score: Float!
}

type DocumentSearchStats {
  total: Int!
  authors: SearchAggregation!
  audios: Int!
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
