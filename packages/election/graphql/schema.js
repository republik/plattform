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
  submitElectionBallot(electionId: ID!, candidateIds: [ID!]!): Election!
}
`
