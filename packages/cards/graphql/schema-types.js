module.exports = `

type Card {
  id: ID!
  payload(
    paths: [String!]
  ): JSON!
  group: CardGroup!
  user(accessToken: ID): User!
  statement: Comment
  documents: DocumentConnection!
  match: Boolean
  totalMatches: Int!
}

input CardFiltersInput {
  parties: [String!]
  fractions: [String!]
  subscribedByMe: Boolean
  mustHave: [CardFiltersMustHaveInput!]
}

enum CardFiltersMustHaveInput {
  portrait
  cleavage
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
  aggregations(
    keys: [CardAggregationKeys!]
  ): [CardAggregation!]!
}

enum CardAggregationKeys {
  party
  fraction
}

type CardAggregation {
  key: String!
  buckets: [CardAggregationBucket!]!
}

type CardAggregationBucket {
  value: String!
  cards(
    first: Int
    last: Int
    before: String
    after: String
  ): CardConnection!
}

type CardGroup {
  id: ID!
  name: String!
  slug: String!
  cards(
    focus: [ID!]
    filters: CardFiltersInput
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
    focus: [ID!]
    filters: CardFiltersInput
    first: Int
    last: Int
    before: String
    after: String
  ): CardConnection!
}

`
