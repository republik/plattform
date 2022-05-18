module.exports = `

schema {
  query: queries
}

type queries {
  search(
    search: String
    # a processor may superseed other arguments
    processor: SearchProcessor
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
    apiKey: String
    # used to (anonymously) track subsequent searches
    # provide the ID from the previous SearchConnection
    trackingId: ID
  ): SearchConnection!
}
`
