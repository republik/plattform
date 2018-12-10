module.exports = `

type DocumentListItem {
  createdAt: Date!
  document: Document!
  description: String
}

interface DocumentList {
  id: ID!
  name: String
  documents: [DocumentListItem!]!
}

type UserDocumentLists {
  readingList: DocumentList!
}

extend type User {
  documentLists: UserDocumentLists!
}

`
