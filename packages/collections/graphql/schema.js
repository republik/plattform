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


  upsertDocumentProgress(
    documentId: ID!
    percentage: Int!
    nodeId: ID!
  ): DocumentProgress!

  removeDocumentProgress(
    documentId: ID!
  ): DocumentProgress!
}
`
