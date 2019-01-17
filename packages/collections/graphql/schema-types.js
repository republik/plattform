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

extend type User {
  collections: [Collection!]!
  collection(name: String!): Collection
}

type DocumentProgress implements CollectionItemInterface {
  id: ID!
  percentage: Int!
  nodeId: String!
  createdAt: DateTime!
  updatedAt: DateTime!
  collection: Collection!
  document: Document
}


extend interface PlayableMedia {
  userPositionMs: Int
}

extend type YoutubeEmbed {
  userPositionMs: Int
}

extend type VimeoEmbed {
  userPositionMs: Int
}

extend type AudioSource {
  userPositionMs: Int
}
`
