export = `
schema {
  query: queries
}

type queries {
  nextReadsSanity(documentId: ID!): [NextReadsSanityResult!]
}
`
