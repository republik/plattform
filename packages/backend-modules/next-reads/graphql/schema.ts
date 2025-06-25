export = `
schema {
  query: queries
}

type queries {
  nextReads(repoId: ID!): [NextReadsResult!]
}
`
