module.exports = `

schema {
  query: queries
}

type queries {
  search(
    search: String
    filter: DocumentSearchFiltersInput
    sort: DocumentsSortInput
    first: Int
    after: String
    before: String
  ): DocumentSearchConnection!
}
`
