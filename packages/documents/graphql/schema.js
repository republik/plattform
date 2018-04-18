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
    search: String
    filter: DocumentSearchFiltersInput
    sort: DocumentsSortInput
    first: Int
    after: String
    before: String
  ): DocumentSearchConnection!
}
`
