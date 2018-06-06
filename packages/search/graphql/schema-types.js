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
  from: DateTime
  to: DateTime
}

enum SearchTypes {
  Document
  Comment
  User
}

enum DocumentTextLengths {
  SHORT
  MEDIUM
  LONG
}

input SearchFilterInput {
  type: SearchTypes
  feed: Boolean
  # repoId
  dossier: String
  # repoId
  format: String
  template: String
  publishedAt: DateRangeInput
  userId: ID
  author: String

  discussion: Boolean
  isSeriesMaster: Boolean
  isSeriesEpisode: Boolean
  hasAudio: Boolean
  hasVideo: Boolean
  textLength: DocumentTextLengths
}

input SearchGenericFilterInput {
  key: String!
  # value as string, get's parsed to the appropriate type
  value: String!
  not: Boolean
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
  label: String!
  buckets: [Bucket!]
}

type Bucket {
  value: String!
  count: Int!
  label: String!
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
