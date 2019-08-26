module.exports = `

schema {
  query: queries
  mutation: mutations
}

type queries {
  userCard(
    id: ID
    token: String
  ): UserCard!

  userCards(
    id: ID
    token: String
    focus: ID
    first: Int
    last: Int
    before: String
    after: String
    undecided: Boolean
  ): UserCardConnection!

  userCardGroup(
    id: ID
  ): UserCardGroup!

  userCardGroups(
    focus: ID
    first: Int
    last: Int
    before: String
    after: String
    undecided: Boolean
  ): UserCardGroupConnection!
}

type mutations {
  claimCard(
    id: ID
    token: String
    email: String!
    portrait: String
    statement: String!
  ): UserCard!

  upsertCardMatches(
    id: [ID!]!
  ): UserCardConnection!

  resetCardMatches(
    group: String
  ): UserCardConnection!
}

`
