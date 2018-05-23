const debug = require('debug')('search:graphql:resolvers:_queries:search')
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
const {
  createSort
} = require('../../../lib/sort')
const {
  __resolveType: resolveHitType
} = require('../SearchEntity')
const { transformUser } = require('@orbiting/backend-modules-auth')

const _ = require('lodash')

const indices = require('../../../lib/indices')

const reduceFilters = filterReducer(documentSchema)
const createElasticFilter = elasticFilterBuilder(documentSchema)

const {
  DOCUMENTS_RESTRICT_TO_ROLES
} = process.env

const DEV = process.env.NODE_ENV && process.env.NODE_ENV !== 'production'

const deepMergeArrays = function (objValue, srcValue) {
  if (_.isArray(objValue)) {
    return objValue.concat(srcValue)
  }
}

const createShould = function (searchTerm, searchFilter) {
  const queries = []

  // A query for each ES index
  indices.list.forEach(({ index, search }) => {
    let must = {
      match_all: {}
    }

    let fields = Object.keys(search.termFields)

    // Append boost if available, annotation "<field name>^<boost>"
    fields = fields.map(field => {
      const boost = search.termFields[field].boost
      if (boost) {
        return `${field}^${boost}`
      }

      return field
    })

    if (searchTerm) {
      must = {
        multi_match: {
          query: searchTerm,
          fields
        }
      }
    }

    debug('must', JSON.stringify(must))

    const filter = _.mergeWith(
      {},
      search.filter,
      createElasticFilter(searchFilter),
      deepMergeArrays
    )

    debug('filter', JSON.stringify(filter))

    queries.push({
      bool: {
        must,
        filter
      }
    })
  })

  return queries
}

const createHighlight = () => {
  const fields = {}

  // A query for each ES index
  indices.list.forEach(({ search }) => {
    Object.keys(search.termFields).forEach((field) => {
      if (search.termFields[field].highlight) {
        fields[field] = search.termFields[field].highlight
      }
    })
  })

  return { fields }
}

const createQuery = (searchTerm, filter, sort) => ({
  query: {
    bool: {
      should: createShould(searchTerm, filter)
    }
  },
  sort: createSort(sort),
  highlight: createHighlight(),
  aggs: extractAggs(documentSchema)
})

const mapHit = (hit) => {
  const type = resolveHitType(hit._source)
  const entity = type === 'User'
    ? transformUser(hit._source)
    : hit._source

  const highlights = []

  Object.keys(hit.highlight || {}).forEach(path => {
    highlights.push({ path, fragments: hit.highlight[path] })
  })

  return {
    entity,
    highlights,
    score: hit._score
  }
}

const mapAggregations = (result, t) => {
  const aggregations = result.aggregations
  if (!aggregations) {
    return []
  }
  return Object.keys(aggregations).map(key => {
    const agg = aggregations[key]
    if (agg.value !== undefined) { // value_count agg
      return {
        key,
        label: t(
          `api/search/aggs/${key}`,
          { key },
          !DEV ? key : undefined
        ),
        count: agg.value
      }
    }
    // terms agg
    return {
      key,
      label: t(
        `api/search/aggs/${key}`,
        { key },
        !DEV ? key : undefined
      ),
      buckets: agg.buckets.map(bucket => ({
        label: t(
          `api/search/aggs/${key}/${bucket.key}`,
          { key, value: bucket.key, count: bucket.doc_count },
          !DEV ? bucket.key : undefined
        ),
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
    elastic,
    t
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
    filters = [],
    sort = {
      key: 'relevance',
      direction: 'DESC'
    },
    first: _first = 40,
    from = 0
  } = options

  debug('options', JSON.stringify(options))

  Object.keys(_filter).forEach(key => {
    filters.push({
      key,
      value: _filter[key]
    })
  })

  const filter = reduceFilters(filters)

  debug('filter', JSON.stringify(filter))

  const first = getFirst(_first, filter, user)

  const query = {
    index: 'republik-*',
    from,
    size: first,
    body: createQuery(search, filter, sort)
  }

  debug('ES query', JSON.stringify(query))
  const result = await elastic.search(query)
  // debug('result: %O', result)

  const hasNextPage = first > 0 && result.hits.total > from + first
  const hasPreviousPage = from > 0
  return {
    nodes: result.hits.hits.map(mapHit),
    aggregations: mapAggregations(result, t),
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
