module.exports = `
schema {
  query: queries
  mutation: mutations
}

type queries {
  votings: [Voting!]!
  voting(name: String!): Voting!
}

type mutations {
  submitVotingBallot(optionId: ID!): Voting!
}
`
