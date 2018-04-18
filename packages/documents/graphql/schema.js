module.exports = `

schema {
  query: queries
}

type queries {
  # (pre)published documents
  documents(
    feed: Boolean
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

  documentsSearch(
    search: String!
    page: Int
    filter: DocumentSearchFiltersInput
  ): DocumentSearchConnection!
}
`
