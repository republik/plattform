module.exports = `

type Card {
  id: ID!
  payload: JSON!
  group: CardGroup!
  user: User!
  statement: Comment
  documents: DocumentConnection!
  match: Boolean
  totalMatches: Int!
}

type CardPageInfo {
  hasNextPage: Boolean!
  endCursor: String
  hasPreviousPage: Boolean!
  startCursor: String
}

type CardConnection {
  totalCount: Int!
  pageInfo: CardPageInfo!
  nodes: [Card!]!
}

type CardGroup {
  id: ID!
  name: String!
  slug: String!
  cards(
    first: Int
    last: Int
    before: String
    after: String
  ): CardConnection!
  discussion: Discussion
}

type CardGroupPageInfo {
  hasNextPage: Boolean!
  endCursor: String
  hasPreviousPage: Boolean!
  startCursor: String
}

type CardGroupConnection {
  totalCount: Int!
  pageInfo: CardGroupPageInfo!
  nodes: [CardGroup!]!
}

extend type User {
  cards(
    first: Int
    last: Int
    before: String
    after: String
  ): CardConnection!
}

`
