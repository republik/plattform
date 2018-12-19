module.exports = `
schema {
  query: queries
  mutation: mutations
}

type queries {
  
}

type mutations {

  addDocumentToList(documentId: ID!, listId: ID!): DocumentList!

  removeDocumentFromList(documentId: ID!, listId: ID!): DocumentList!

}

`
