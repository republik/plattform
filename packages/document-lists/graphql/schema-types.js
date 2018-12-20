module.exports = `

type DocumentListItem {
  createdAt: Date!
  documentList: DocumentList!
}

interface DocumentList {
  id: ID!
  name: String!
  documents(
    first: Int
    last: Int
    before: String
    after: String
  ): DocumentConnection!
}

extend type Document {
  userListItems: [DocumentListItem!]!
}

extend type User {
  documentLists: [DocumentList!]!
  documentList(name: String!): DocumentList
}

`
