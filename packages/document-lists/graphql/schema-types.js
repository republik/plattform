module.exports = `

type DocumentListItem {
  createdAt: Date!
  documentList: DocumentList!
}

interface DocumentList {
  id: ID!
  name: String
  documents: DocumentConnection!
}

type UserDocumentLists {
  readingList: DocumentList!
}

extend type Document {
  userListItems: [DocumentListItem!]!
}

extend type User {
  documentLists: UserDocumentLists!
}

`
