module.exports = `
schema {
  query: queries
  mutation: mutations
}

type mutations {
  addDocumentToList(
    documentId: ID!
    listName: ID!
  ): Document!

  removeDocumentFromList(
    documentId: ID!
    listName: ID!
  ): Document
}
`
