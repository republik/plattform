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
    repoId: ID!,
    listName: ID!
  ): DocumentList!

  removeDocumentFromList(
    repoId: ID!,
    listName: ID!
  ): DocumentList!
}
`
