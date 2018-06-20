module.exports = `

schema {
  query: queries
}

type queries {
  # (pre)published documents
  documents(
    feed: Boolean
    # not used
    dossier: String
    format: String
    template: String
    first: Int
    last: Int
    before: String
    after: String
  ): DocumentConnection!
  # (pre)published document
  document(path: String!): Document
}
`
