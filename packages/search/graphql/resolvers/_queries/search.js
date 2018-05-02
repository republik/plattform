const debug = require('debug')('search:documents')
const {
  Roles: {
    userIsInRoles
  }
} = require('@orbiting/backend-modules-auth')

const {
  schema: documentSchema
} = require('../../../lib/Documents')
const {
  filterReducer,
  elasticFilterBuilder
} = require('../../../lib/filters')
const {
  extractAggs
} = require('../../../lib/aggregations')

const reduceFilters = filterReducer(documentSchema)
const createElasticFilter = elasticFilterBuilder(documentSchema)

const {
  DOCUMENTS_RESTRICT_TO_ROLES
} = process.env

const sortKeyMapping = {
  relevance: '_score',
  publishedAt: 'meta.publishDate',
  mostRead: 'agg.views', // TODO
  mostDebated: 'agg.comments' // TODO
}
const sanitizeSort = (sort) => ([
  {
    [sortKeyMapping[sort.key]]: sort.direction
  }
])

const createQuery = (searchTerm, filter, sort) => ({
  // _source: ['meta.*', 'content'],
  query: {
    bool: {
      must: searchTerm
        ? {
          multi_match: {
            query: searchTerm,
            fields: [
              'meta.title^3',
              'meta.description^2',
              'meta.authors^2',
              'contentString',
              'content'
            ]
          }
        }
        : { match_all: {} },
      filter: {
        bool: createElasticFilter(filter)
      }
    }
  },
  sort: sanitizeSort(sort),
  highlight: {
    fields: {
      contentString: {}
    }
  },
  aggs: extractAggs(documentSchema)
})

const mapDocumentHit = (hit) => {
  return {
    entity: hit._source,
    highlights: (hit.highlight || {}).contentString || [],
    score: hit._score
  }
}

const mapAggregations = (result) => {
  const aggregations = result.aggregations
  if (!aggregations) {
    return []
  }
  return Object.keys(aggregations).map(key => {
    const agg = aggregations[key]
    if (agg.value !== undefined) { // value_count agg
      return {
        key,
        count: agg.value
      }
    }
    // terms agg
    return {
      key,
      buckets: agg.buckets.map(bucket => ({
        value: bucket.key,
        count: bucket.doc_count
      }))
    }
  })
}

const cleanOptions = (options) => ({
  ...options,
  after: undefined,
  before: undefined,
  filters: undefined
})

const stringifyOptions = (options) =>
  Buffer.from(JSON.stringify(cleanOptions(options))).toString('base64')

const parseOptions = (options) => {
  try {
    return JSON.parse(Buffer.from(options, 'base64').toString())
  } catch (e) {
    console.info('failed to parse options:', options, e)
  }
  return {}
}

const MAX_NODES = 500
const getFirst = (first, filter, user) => {
  // we only restrict the nodes array
  // making totalCount always available
  // - querying a single document by path is always allowed
  if (DOCUMENTS_RESTRICT_TO_ROLES && !filter.path && !filter.repoId) {
    const roles = DOCUMENTS_RESTRICT_TO_ROLES.split(',')
    if (!userIsInRoles(user, roles)) {
      return 0
    }
  }
  if (first > MAX_NODES) {
    return MAX_NODES
  }
  return first
}

module.exports = async (
  _,
  args,
  {
    user,
    elastic
  }
) => {
  const { after, before } = args
  const options = after
    ? { ...args, ...parseOptions(after) }
    : before
      ? { ...args, ...parseOptions(before) }
      : args

  const {
    search,
    filter: _filter = { },
    filters,
    sort = {
      key: 'relevance',
      direction: 'DESC'
    },
    first: _first = 40,
    from = 0
  } = options

  const filter = filters
    ? {
      ...reduceFilters(filters),
      ..._filter
    }
    : _filter

  const first = getFirst(_first, filter, user)

  const query = {
    index: 'republik-*',
    from,
    size: first,
    body: createQuery(search, filter, sort)
  }
  debug('query: %O', query)
  const result = await elastic.search(query)
  // debug('result: %O', result)

  const hasNextPage = first > 0 && result.hits.total > from + first
  const hasPreviousPage = from > 0
  return {
    nodes: result.hits.hits.map(mapDocumentHit),
    aggregations: mapAggregations(result),
    totalCount: result.hits.total,
    pageInfo: {
      hasNextPage,
      endCursor: hasNextPage
        ? stringifyOptions({
          ...options,
          filter,
          first,
          from: from + first
        })
        : null,
      hasPreviousPage,
      startCursor: hasPreviousPage
        ? stringifyOptions({
          ...options,
          filter,
          first,
          from: from - first
        })
        : null
    }
  }
}
