export = `
schema {
  query: queries
}

type queries {
  nextReads(repoId: ID!): [NextReadsResult!]
  nextReadsSanity(documentId: ID!): [NextReadsSanityResult!]
}
`
