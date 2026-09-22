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

  """
  Null for Sanity-backed items — they have no GraphQL \`Document\`. Read
  \`sanityId\` and fetch preview data from Sanity instead.
  """
  document: Document

  "publikator repoId, when the item points at a publikator document"
  repoId: ID

  "Sanity \`_id\`, when the item points at Sanity-backed content"
  sanityId: ID
}

"""
A reference to a document in a collection, without resolving the document
itself. Exactly one of \`repoId\` / \`sanityId\` is set.
"""
type CollectionItemRef {
  id: ID!
  createdAt: DateTime!

  "publikator repoId, when the item points at a publikator document"
  repoId: ID

  "Sanity \`_id\`, when the item points at Sanity-backed content"
  sanityId: ID
}

type CollectionItemRefConnection {
  totalCount: Int!
  pageInfo: CollectionItemPageInfo!
  nodes: [CollectionItemRef!]!
}

"""
A user's reading progress for a document, without resolving the document
itself. Exactly one of \`repoId\` / \`sanityId\` is set.
"""
type DocumentProgressRef {
  id: ID!
  percentage: Float!
  nodeId: String!
  createdAt: DateTime!
  updatedAt: DateTime!

  "publikator repoId, when the item points at a publikator document"
  repoId: ID

  "Sanity \`_id\`, when the item points at Sanity-backed content"
  sanityId: ID

  "the entry with the highest percentage recorded for the same document"
  max: DocumentProgressRef
}

"""
An audio queue item, without resolving the document itself. Exactly one of
\`repoId\` / \`sanityId\` is set.
"""
type AudioQueueItemRef {
  id: ID!

  """
  Sequence number of this item
  """
  sequence: Int!

  createdAt: DateTime!
  updatedAt: DateTime!

  "publikator repoId, when the item points at a publikator document"
  repoId: ID

  "Sanity \`_id\`, when the item points at Sanity-backed content"
  sanityId: ID

  """
  Key for \`mediaProgress\` / \`upsertMediaProgress\` — the playback position of
  this item's audio. Set for both publikator and Sanity-backed items.
  """
  mediaId: ID

  """
  The user's playback position for this item's audio, so a whole queue can be
  rendered with progress in one request. Batched across the queue — reading it
  for every item costs one query, not one per item. Null when the user has
  opted out of progress tracking.
  """
  userProgress: MediaProgress
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
    excludeRepoId: ID
    lastDays: Int
    uniqueDocuments: Boolean
    first: Int
    last: Int
    before: String
    after: String
  ): CollectionItemConnection!

  """
  Returns a queue with audio items point to playable content. Use
  mutations \`addAudioQueueItem\`, \`moveAudioQueueItem\`,
  \`removeAudioQueueItem\` or \`clearAudioQueue\` to modify queue.
  """
  audioQueue: [AudioQueueItem!]
}

type DocumentProgress implements CollectionItemInterface {
  id: ID!
  percentage: Float!
  nodeId: String!
  createdAt: DateTime!
  updatedAt: DateTime!
  collection: Collection!

  """
  Null for Sanity-backed items — they have no GraphQL \`Document\`. Read
  \`sanityId\` and fetch preview data from Sanity instead.
  """
  document: Document

  "publikator repoId, when the item points at a publikator document"
  repoId: ID

  "Sanity \`_id\`, when the item points at Sanity-backed content"
  sanityId: ID

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

"""
An item in an audio queue.
"""
type AudioQueueItem implements CollectionItemInterface {
  id: ID!

  """
  Sequence number of this item
  """ 
  sequence: Int!

  createdAt: DateTime!
  updatedAt: DateTime!
  collection: Collection!
  document: Document
}

enum AudioQueueEntityType {
  Document
}

"""
Provide an entitiy type (e. g. \`Document\`) and its ID
""" 
input AudioQueueEntityInput {
  type: AudioQueueEntityType!
  id: ID!
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
