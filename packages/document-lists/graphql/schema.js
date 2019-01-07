module.exports = `
schema {
  query: queries
  mutation: mutations
}

type queries {
  documentLists: [DocumentList!]!
}

type mutations {
  addDocumentToList(
    documentId: ID!,
    listName: ID!
  ): DocumentList!

  removeDocumentFromList(
    documentId: ID!,
    listName: ID!
  ): DocumentList!
}
`
