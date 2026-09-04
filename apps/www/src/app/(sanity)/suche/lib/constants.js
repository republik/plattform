// One tab per searchable kind, in tab order. This is the single source of the
// kind/filter mapping -- typesenseAdapter builds its KINDS table from it, so
// the tabs and the searches behind them cannot drift apart. `kind` is inert
// for the url: getSearchParams, isSameFilter and findAggregation all read only
// `key` and `value`.
export const SUPPORTED_FILTERS = [
  { kind: 'Document', key: 'type', value: 'Document' },
  { kind: 'Audio', key: 'audioSourceKind', value: 'readAloud' },
  { kind: 'User', key: 'type', value: 'User' },
  { kind: 'Comment', key: 'type', value: 'Comment' },
]

export const filterLabelKey = (filter) =>
  `search/filter/${filter.key}/${filter.value}`

export const SUPPORTED_SORT = [
  {
    key: 'relevance',
    needsQuery: true,
  },
  {
    key: 'publishedAt',
    directions: ['DESC', 'ASC'],
  },
]
export const LATEST_SORT = {
  key: 'publishedAt',
  direction: 'DESC',
}

export const DEFAULT_FILTER = SUPPORTED_FILTERS[0]
export const DEFAULT_SORT = {
  key: 'relevance',
}

export const isSameFilter = (filterA, filterB) =>
  filterA.key === filterB.key && filterA.value === filterB.value

export const findAggregation = (aggregations, filter) => {
  const agg = aggregations.find((d) => d.key === filter.key)
  return !agg || !agg.buckets
    ? agg
    : agg.buckets.find((d) => d.value === filter.value)
}
