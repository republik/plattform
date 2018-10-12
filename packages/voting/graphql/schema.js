module.exports = `
schema {
  query: queries
  mutation: mutations
}

type queries {
  votings: [Voting!]!
  voting(slug: String!): Voting

  elections: [Election!]!
  election(slug: String!): Election
}

type mutations {
  createVoting(votingInput: VotingInput!): Voting!
  submitVotingBallot(
    votingId: ID!
    optionId: ID
  ): Voting!

  createElection(electionInput: ElectionInput!): Election!
  submitCandidacy(slug: String!): Candidacy!
  cancelCandidacy(slug: String!): Election!
  submitElectionBallot(
    electionId: ID!
    candidacyIds: [ID!]!
  ): Election!
}
`
