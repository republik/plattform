const { getProcessorsList } = require('../lib/options')

module.exports = `

scalar Date

enum OrderDirection {
  ASC
  DESC
}

enum SearchProcessor {
${getProcessorsList().join('\n')}
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
  DocumentZone
  Comment
  User
}

enum DocumentTextLengths {
  SHORT
  MEDIUM
  LONG
}

input SearchFilterInput {
  id: ID
  ids: [ID!]
  repoIds: [ID!]
  type: SearchTypes
  feed: Boolean
  # repoId
  dossier: String
  hasDossier: Boolean
  # repoId
  format: String
  # repoIds
  formats: [String!]
  hasFormat: Boolean
  template: String
  publishedAt: DateRangeInput
  scheduledAt: DateRangeInput
  userId: ID
  author: String
  discussion: Boolean
  isSeriesMaster: Boolean
  isSeriesEpisode: Boolean
  audioSourceKind: AudioSourceKind
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
  aggregations(keys: [String!]): [SearchAggregation!]!
  pageInfo: SearchPageInfo!
  totalCount: Int!
  # used to (anonymously) track subsequent searches
  # provide this id to following search queries
  trackingId: ID
}

type SearchNode {
  entity: SearchEntity!
  highlights: [SearchHighlight!]!
  score: Float
}

union SearchEntity = Document | DocumentZone | Comment | User

type SearchHighlight {
  path: String!
  fragments: [String!]!
}

type SearchAggregation {
  key: String!
  count: Int
  label: String!
  buckets: [SearchAggregationBucket!]
}

type SearchAggregationBucket {
  value: String!
  count: Int!
  label: String!
}

type SearchPageInfo {
  hasNextPage: Boolean!
  endCursor: String
  hasPreviousPage: Boolean!
  startCursor: String
}
`
