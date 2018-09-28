module.exports = `
schema {
  query: queries
  mutation: mutations
}

type queries {
  votings: [Voting!]!
  voting(slug: String!): Voting!
}

type mutations {
  submitVotingBallot(optionId: ID!): Voting!
}
`
