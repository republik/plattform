module.exports = `
schema {
  query: queries
  mutation: mutations
}

type queries {
  mediaProgress(mediaId: ID!): MediaProgress
  collectionsStats: CollectionsStats!

  """
  The current user's items in a collection, as bare document references —
  no \`Document\` resolution. For content (e.g. Sanity-backed articles) whose
  preview data the client fetches itself. The full list also lets a client
  tell whether a given document is in the collection without a per-document
  round trip.
  """
  userCollectionItems(collectionName: String!): [CollectionItemRef!]!
}

type mutations {
  addDocumentToCollection(
    documentId: ID!
    collectionName: String!
  ): CollectionItem!

  removeDocumentFromCollection(
    documentId: ID!
    collectionName: String!
  ): CollectionItem

  clearCollection(
    collectionName: String!
  ): Collection!


  upsertDocumentProgress(
    documentId: ID!
    # between 0 and 1
    percentage: Float!
    nodeId: String!
  ): DocumentProgress!

  removeDocumentProgress(
    documentId: ID!
  ): DocumentProgress


  upsertMediaProgress(
    mediaId: ID!
    secs: Float!
  ): MediaProgress!

  removeMediaProgress(
    mediaId: ID!
  ): MediaProgress

  clearProgress: Collection!

  """
  Add an item to \`User.audioQueue\`.
  If \`sequence\` number is not provided, item will be appended.
  An item might get a different \`sequence\` number assigned then provided.
  """ 
  addAudioQueueItem(
    entity: AudioQueueEntityInput!
    sequence: Int
  ): [AudioQueueItem!]!

  """
  Move an existing item within \`User.audioQueue\`.
  Unless \`sequence\` number exceeds maximum \`sequence\` number, an item will put onto \`sequence\` number.
  """ 
  moveAudioQueueItem(
    id: ID!
    sequence: Int!
  ): [AudioQueueItem!]!

  """
  Move an existing item from \`User.audioQueue\`.
  """ 
  removeAudioQueueItem(
    id: ID!
  ): [AudioQueueItem!]!

  """
  Clear all items in \`User.audioQueue\`.
  """ 
  clearAudioQueue: [AudioQueueItem!]!

  """
  Reorder existing items at once.
  A non-existant item ID will be ignored.
  If an item exists in queue but its ID is not submitted, it will be deleted.
  """
  reorderAudioQueue(ids: [ID!]!): [AudioQueueItem!]!
}
`
