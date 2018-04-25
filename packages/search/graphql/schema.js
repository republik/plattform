module.exports = `

schema {
  query: queries
}

type queries {
  search(
    search: String
    # specify specific filters
    # mixed with filters, SearchFilterInput takes precedence
    filter: SearchFilterInput
    # specify filters as array
    # mixed with filter, SearchFilterInput takes precedence
    filters: [SearchGenericFilterInput!]
    sort: SearchSortInput
    first: Int
    after: String
    before: String
  ): SearchConnection!
}
`
