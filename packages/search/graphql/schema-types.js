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

enum SearchTypes {
  Document
  Comment
  User
}

enum DocumentTextLengths {
  SHORT
  MIDDLE
  LONG
}

input SearchFilterInput {
  feed: Boolean
  # repoId
  dossier: String
  # repoId
  format: String
  template: String
  publishedAt: DateRangeInput
  # check if username was supported before
  userId: ID
  author: String

  seriesMaster: String
  discussion: Boolean
  audio: Boolean
  video: Boolean
  type: SearchTypes
  textLength: DocumentTextLengths
}

input SearchGenericFilterInput {
  key: String!
  # value as string, get's parsed to the appropriate type
  value: String!
}

type SearchConnection {
  nodes: [SearchNode!]!
  aggregations: [SearchAggregation!]!
  pageInfo: SearchPageInfo!
  totalCount: Int!
}

type SearchNode {
  entity: SearchEntity!
  highlights: [SearchHighlight!]!
  score: Float
}

union SearchEntity = Document | Comment | User

type SearchHighlight {
  path: String!
  fragments: [String!]!
}

type SearchAggregation {
  key: String!
  count: Int
  buckets: [Bucket!]
}

type Bucket {
  value: String!
  count: Int!
}

#union Bucket = SearchAggregationBucketString | SearchAggregationBucketBoolean

type SearchAggregationBucketString {
  value: String!
  count: Int!
}
type SearchAggregationBucketBoolean {
  value: Boolean!
  count: Int!
}

type SearchPageInfo {
  hasNextPage: Boolean!
  endCursor: String
  hasPreviousPage: Boolean!
  startCursor: String
}
`
