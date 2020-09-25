module.exports = `

interface CollectionItemInterface {
  id: ID!
  createdAt: DateTime!
  collection: Collection!
  document: Document
}

type CollectionItem implements CollectionItemInterface {
  id: ID!
  createdAt: DateTime!
  collection: Collection!
  document: Document
}

type CollectionItemConnection {
  totalCount: Int!
  pageInfo: CollectionItemPageInfo!
  nodes: [CollectionItem!]!
}

type CollectionItemPageInfo {
  hasNextPage: Boolean!
  endCursor: String
  hasPreviousPage: Boolean!
  startCursor: String
}

type Collection {
  id: ID!
  name: String!
  # order by item.createdAt DESC
  items(
    first: Int
    last: Int
    before: String
    after: String
  ): CollectionItemConnection!
}

extend type Document {
  userCollectionItems: [CollectionItem!]!
  userCollectionItem(collectionName: String!): CollectionItem
  userProgress: DocumentProgress
}

enum ProgressState {
  FINISHED
  UNFINISHED
}

extend type User {
  collections: [Collection!]!
  collection(name: String!): Collection
  collectionItems(
    names: [String!]!
    progress: ProgressState
    lastDays: Int
    first: Int
    last: Int
    before: String
    after: String
  ): CollectionItemConnection!
}

type DocumentProgress implements CollectionItemInterface {
  id: ID!
  percentage: Float!
  nodeId: String!
  createdAt: DateTime!
  updatedAt: DateTime!
  collection: Collection!
  document: Document
  # get entity with max percentage for same doc
  max: DocumentProgress
}

type MediaProgress implements CollectionItemInterface {
  id: ID!
  mediaId: ID!
  # progress in milliseconds
  secs: Float!
  createdAt: DateTime!
  updatedAt: DateTime!
  collection: Collection!
  # never resolved on MediaProgress
  document: Document
  # get entity with max secs for same mediaId
  max: MediaProgress
}


extend interface PlayableMedia {
  userProgress: MediaProgress
}

extend type YoutubeEmbed {
  userProgress: MediaProgress
}

extend type VimeoEmbed {
  userProgress: MediaProgress
}

extend type AudioSource {
  userProgress: MediaProgress
}

type CollectionsStats {
  evolution(
    "Collection name"
    name: String!
    "Minimum month (YYYY-MM)"
    min: YearMonthDate!
    "Maximum month (YYYY-MM)"
    max: YearMonthDate!
  ): CollectionsStatsEvolution!
  # Evolution data 30 days ago up until now
  last(
    "Collection name"
    name: String!
  ): CollectionsStatsBucket!
}

type CollectionsStatsEvolution {
  buckets: [CollectionsStatsBucket!]
  updatedAt: DateTime!
}

type CollectionsStatsBucket {
  "Bucket key (YYYY-MM)"
  key: String!

  "Amount of records"
  records: Int!

  "Amount of documents"
  documents: Int!

  "Amount of media"
  medias: Int!

  "Amount of unqiue users"
  users: Int!

  updatedAt: DateTime!
}
`
