module.exports = `
schema {
  query: queries
  mutation: mutations
}

type queries {
  mediaProgress(mediaId: ID!): MediaProgress
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
}
`
