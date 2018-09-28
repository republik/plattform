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
  submitCandidacy(slug: String!): Candidacy!
  cancelCandidacy(slug: String!): Election!
}
`
