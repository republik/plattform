module.exports = `

schema {
  query: queries
  mutation: mutations
}

type queries {
  card(
    id: ID
    token: String
  ): Card!

  cards(
    id: ID
    token: String
    focus: ID
    first: Int
    last: Int
    before: String
    after: String
    undecided: Boolean
  ): CardConnection!

  cardGroup(
    id: ID
    slug: String
  ): CardGroup!

  cardGroups(
    first: Int
    last: Int
    before: String
    after: String
  ): CardGroupConnection!
}

type mutations {
  claimCard(
    id: ID
    token: String
    email: String!
    portrait: String
    statement: String!
  ): Card!

  upsertCardMatches(
    id: [ID!]!
  ): CardConnection!

  resetCardMatches(
    group: String
  ): CardConnection!
}

`
