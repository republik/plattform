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
  preview data the client fetches itself. Newest first.
  """
  userCollectionItems(
    collectionName: String!
    first: Int
    last: Int
    before: String
    after: String
  ): CollectionItemRefConnection!

  """
  A single item, or null when the document is not in the collection.
  \`documentId\` accepts a publikator repoId or base64 documentId, or a
  Sanity \`_id\`.
  """
  userCollectionItem(documentId: ID!, collectionName: String!): CollectionItemRef

  """
  Batch equivalent of \`userCollectionItem\`: returns one entry per
  \`documentIds\` entry, in the same order, null where the document is not in
  the collection.
  """
  userCollectionItemsByIds(
    documentIds: [ID!]!
    collectionName: String!
  ): [CollectionItemRef]!

  """
  The current user's items across several collections, as bare document refs —
  the Sanity-capable counterpart of \`User.collectionItems\`, which is
  publikator-only because its \`document\` field must resolve. Most recently
  updated first.
  """
  userCollectionItemsByNames(
    names: [String!]!
    progress: ProgressState
    "a publikator repoId or base64 documentId, or a Sanity \`_id\`, to omit"
    excludeDocumentId: ID
    lastDays: Int
    uniqueDocuments: Boolean
    first: Int
    last: Int
    before: String
    after: String
  ): CollectionItemRefConnection!

  """
  The current user's reading progress for one document, or null when there is
  none. \`documentId\` accepts a publikator repoId or base64 documentId, or a
  Sanity \`_id\`.
  """
  userDocumentProgress(documentId: ID!): DocumentProgressRef

  """
  Batch equivalent of \`userDocumentProgress\`: returns one entry per
  \`documentIds\` entry, in the same order, null where there is no progress.
  """
  userDocumentProgressByIds(documentIds: [ID!]!): [DocumentProgressRef]!

  """
  The current user's audio queue as bare document refs, including
  Sanity-backed items — \`User.audioQueue\` is publikator-only. Ordered by
  \`sequence\`.
  """
  userAudioQueue: [AudioQueueItemRef!]!
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
  ): [AudioQueueItem!]! @deprecated(reason: "publikator-only — returns the queue as AudioQueueItem, which cannot represent a Sanity-backed item. Use 'addAudioQueueItemRef'.")

  """
  Move an existing item within \`User.audioQueue\`.
  Unless \`sequence\` number exceeds maximum \`sequence\` number, an item will put onto \`sequence\` number.
  """ 
  moveAudioQueueItem(
    id: ID!
    sequence: Int!
  ): [AudioQueueItem!]! @deprecated(reason: "publikator-only — returns the queue as AudioQueueItem, which cannot represent a Sanity-backed item. Use 'moveAudioQueueItemRef'.")

  """
  Move an existing item from \`User.audioQueue\`.
  """ 
  removeAudioQueueItem(
    id: ID!
  ): [AudioQueueItem!]! @deprecated(reason: "publikator-only — returns the queue as AudioQueueItem, which cannot represent a Sanity-backed item. Use 'removeAudioQueueItemRef'.")

  """
  Clear all items in \`User.audioQueue\`.
  """ 
  clearAudioQueue: [AudioQueueItem!]! @deprecated(reason: "publikator-only — returns the queue as AudioQueueItem, which cannot represent a Sanity-backed item. Use 'clearAudioQueueRefs'.")

  """
  Reorder existing items at once.
  A non-existant item ID will be ignored.
  Items that exist in the queue but whose ID is not submitted are kept and
  appended after the reordered ones — use \`removeAudioQueueItem\` or
  \`clearAudioQueue\` to delete. (This used to delete them, which silently
  destroyed items a partially-informed client could not see, e.g. Sanity-backed
  ones absent from \`User.audioQueue\`.)
  """
  reorderAudioQueue(ids: [ID!]!): [AudioQueueItem!]! @deprecated(reason: "publikator-only — returns the queue as AudioQueueItem, which cannot represent a Sanity-backed item. Use 'reorderAudioQueueRefs'.")

  """
  Sanity-capable counterparts of the \`*AudioQueue*\` mutations above. Identical
  behaviour and arguments; they return the queue as \`AudioQueueItemRef\`, so
  Sanity-backed items are included and carry \`sanityId\` / \`mediaId\`. The
  originals cannot represent those, so they return publikator items only —
  which notably means the item you just added may be missing from their reply.
  """
  addAudioQueueItemRef(
    entity: AudioQueueEntityInput!
    sequence: Int
  ): [AudioQueueItemRef!]!

  moveAudioQueueItemRef(
    id: ID!
    sequence: Int!
  ): [AudioQueueItemRef!]!

  removeAudioQueueItemRef(
    id: ID!
  ): [AudioQueueItemRef!]!

  reorderAudioQueueRefs(ids: [ID!]!): [AudioQueueItemRef!]!

  clearAudioQueueRefs: [AudioQueueItemRef!]!
}`
