module.exports = `

type UserListItem {
  id: ID!
  createdAt: DateTime!
  list: UserList!
}

type UserList {
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
  userListItems: [UserListItem!]!
}

extend type User {
  lists: [UserList!]!
  list(name: String!): UserList
}
`
