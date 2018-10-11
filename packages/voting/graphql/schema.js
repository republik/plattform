module.exports = `
schema {
  query: queries
  mutation: mutations
}

type queries {
  votings: [Voting!]!
  voting(slug: String!): Voting
}

type mutations {
  createVoting(votingInput: VotingInput!): Voting!
  submitVotingBallot(
    votingId: ID!
    optionId: ID
  ): Voting!
}
`
