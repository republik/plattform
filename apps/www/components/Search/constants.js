export const DEFAULT_FILTERS = [{ key: 'template', value: 'front', not: true }]

export const SUPPORTED_FILTERS = [
  {
    key: 'type',
    value: 'Document',
  },
  {
    key: 'hasAudio',
    value: 'true',
  },
  {
    key: 'hasVideo',
    value: 'true',
  },
  {
    key: 'type',
    value: 'User',
  },
  {
    key: 'type',
    value: 'Comment',
  },
]

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

export const DEFAULT_AGGREGATION_KEYS = ['type', 'hasAudio', 'hasVideo']
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
