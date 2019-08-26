module.exports = `

type UserCard {
  id: ID!
  payload: JSON!
  group: UserCardGroup!
  user: User
  documents: DocumentConnection!
  match: Boolean
  totalMatches: Int!
}

type UserCardPageInfo {
  hasNextPage: Boolean!
  endCursor: String
  hasPreviousPage: Boolean!
  startCursor: String
}

type UserCardConnection {
  totalCount: Int!
  pageInfo: UserCardPageInfo!
  nodes: [UserCard!]!
}

type UserCardGroup {
  id: ID!
  name: String!
  slug: String!
  cards(
    first: Int
    last: Int
    before: String
    after: String
  ): UserCardConnection!
  discussion: Discussion
}

type UserCardGroupPageInfo {
  hasNextPage: Boolean!
  endCursor: String
  hasPreviousPage: Boolean!
  startCursor: String
}

type UserCardGroupConnection {
  totalCount: Int!
  pageInfo: UserCardGroupPageInfo!
  nodes: [UserCardGroup!]!
}

extend type User {
  card: UserCard
}

`
