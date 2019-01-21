module.exports = `
schema {
  mutation: mutations
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


  enableProgressTracking: User!
  # disabling tracking also deletes all items
  disableProgressTracking: User!
  clearProgress: Collection!


  upsertDocumentProgress(
    documentId: ID!
    percentage: Int!
    nodeId: String!
  ): DocumentProgress!

  removeDocumentProgress(
    documentId: ID!
  ): DocumentProgress


  upsertMediaProgress(
    mediaId: ID!
    ms: Int!
  ): MediaProgress!

  removeMediaProgress(
    mediaId: ID!
  ): MediaProgress

}
`
