module.exports = `

schema {
  query: queries
  mutation: mutations
}

type queries {
  card(
    id: ID
    accessToken: ID
  ): Card

  cards(
    id: ID
    accessToken: ID
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
  ): CardGroup

  cardGroups(
    first: Int
    last: Int
    before: String
    after: String
  ): CardGroupConnection!
}

type mutations {
  claimCard(
    id: ID!
    accessToken: ID!
    portrait: String
    statement: String!
  ): Card!

  updateCard(
    id: ID!
    portrait: String
    statement: String!
    payload: JSON!
  ): Card!
}

`
