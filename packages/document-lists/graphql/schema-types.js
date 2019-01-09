module.exports = `

type DocumentListItem {
  id: ID!
  createdAt: Date!
  documentList: DocumentList!
}

type DocumentList {
  id: ID!
  name: String!
  userDocuments(
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
