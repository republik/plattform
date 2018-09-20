module.exports = `
schema {
  query: queries
  mutation: mutations
}

type queries {
  elections: [Election!]!
  election(slug: String!): Election!
}

type mutations {
  createElection(electionInput: ElectionInput!): Election!
  submitElectionBallot(slug: String!, candidateIds: [ID!]!): Election!
  submitCandidacy(slug: String!): Candidate!
  cancelCandidacy(slug: String!): Election!
}
`
