module.exports = `

schema {
  query: queries
}

type queries {
  # (pre)published documents
  documents(feed: Boolean): [Document]!
  # (pre)published document
  document(slug: String!): Document
}
`
