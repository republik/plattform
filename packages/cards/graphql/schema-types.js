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
}

input CardFiltersInput {
  parties: [String!]
  fractions: [String!]
  candidacies: [String!]
  elects: [String!]
  elected: Boolean
  subscribedByMe: Boolean
  mustHave: [CardFiltersMustHaveInput!]
}

enum CardFiltersMustHaveInput {
  portrait
  smartspider
  statement
  financing
}

input CardSortInput {
  smartspider: [Float]
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
  medians: CardMedians!
}

enum CardAggregationKeys {
  party
  fraction
  election
  nationalCouncilElection
  councilOfStatesElection
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

type CardMedians {
  smartspider: [Float!]
}

type CardGroup {
  id: ID!
  name: String!
  slug: String!
  cards(
    focus: [ID!]
    sort: CardSortInput
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
    sort: CardSortInput
    filters: CardFiltersInput
    first: Int
    last: Int
    before: String
    after: String
  ): CardConnection!
}

`
