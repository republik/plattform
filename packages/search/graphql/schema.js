module.exports = `

schema {
  query: queries
}

type queries {
  search(
    search: String
    filter: SearchFiltersInput
    sort: SearchSortInput
    first: Int
    after: String
    before: String
  ): SearchConnection!
}
`
