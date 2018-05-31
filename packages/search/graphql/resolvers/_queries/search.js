const debug = require('debug')('search:graphql:resolvers:_queries:search')
const {
  Roles: {
    userIsInRoles
  }
} = require('@orbiting/backend-modules-auth')

const {
  schema: documentSchema,
  addRelatedDocs
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
const { getIndexAlias } = require('../../../lib/utils')

const reduceFilters = filterReducer(documentSchema)
const createElasticFilter = elasticFilterBuilder(documentSchema)

const {
  DOCUMENTS_RESTRICT_TO_ROLES,
  SEARCH_TRACK = false
} = process.env

const DEV = process.env.NODE_ENV && process.env.NODE_ENV !== 'production'

const deepMergeArrays = function (objValue, srcValue) {
  if (_.isArray(objValue)) {
    return objValue.concat(srcValue)
  }
}

const createShould = function (searchTerm, searchFilter, indicesList) {
  const queries = []

  // A query for each ES index
  indicesList.forEach(({ index, search }) => {
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

    debug('filter', JSON.stringify(filter, null, 2))

    queries.push({
      bool: {
        must,
        filter
      }
    })
  })

  return queries
}

const createHighlight = (indicesList) => {
  const fields = {}

  // A query for each ES index
  indicesList.forEach(({ search }) => {
    Object.keys(search.termFields).forEach((field) => {
      if (search.termFields[field].highlight) {
        fields[field] = search.termFields[field].highlight
      }
    })
  })

  return { fields }
}

const createQuery = (searchTerm, filter, sort, indicesList) => ({
  query: {
    bool: {
      should: createShould(searchTerm, filter, indicesList)
    }
  },
  sort: createSort(sort),
  highlight: createHighlight(indicesList),
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
    score: hit._score,
    type
  }
}

const transformTermsAgg = (key, agg, t) => ({
  key,
  label: t(
    `api/search/aggs/${key}`,
    { key },
    !DEV ? key : undefined
  ),
  buckets: agg.terms.buckets.map(bucket => ({
    label: t(
      `api/search/aggs/${key}/${bucket.key}`,
      { key, value: bucket.key, count: bucket.doc_count },
      !DEV ? bucket.key : undefined
    ),
    value: bucket.key,
    count: bucket.doc_count
  }))
})

const transformCountAgg = (key, agg, t) => ({
  key,
  label: t(
    `api/search/aggs/${key}`,
    { key },
    !DEV ? key : undefined
  ),
  count: agg.count ? agg.count.value : agg.doc_count
})

const transformRangeAgg = (key, agg, t) => ({
  key,
  label: t(
    `api/search/aggs/${key}`,
    { key },
    !DEV ? key : undefined
  ),
  count: agg.doc_count,
  buckets: agg.ranges.buckets.map(bucket => ({
    label: t(
      `api/search/aggs/${key}/${bucket.key}`,
      { key, value: bucket.key, count: bucket.doc_count },
      !DEV ? bucket.key : undefined
    ),
    value: bucket.key,
    count: bucket.doc_count
  }))
})

const mapAggregations = (result, t) => {
  const aggregations = result.aggregations
  if (!aggregations) {
    return []
  }
  return Object.keys(aggregations).map(name => {
    const parts = name.match(/(.*?)\/(.*)/)
    const type = parts[1]
    const key = parts[2]

    const agg = aggregations[name]

    switch (type) {
      case 'terms':
        return transformTermsAgg(key, agg, t)
      case 'valueCount':
      case 'trueCount':
      case 'existsCount':
        return transformCountAgg(key, agg, t)
      case 'range':
        return transformRangeAgg(key, agg, t)
      default:
        throw Error(`Unable to transform aggregation type "${type}"`)
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

const getIndicesList = (filter) => {
  let limitType
  filter && Object.keys(filter)
    .forEach(fKey => {
      const filterEntry = filter[fKey]
      if (filterEntry.key === 'type') {
        limitType = filterEntry.value
      }
    })
  const indicesFilter = limitType
    ? ({type}) => type === limitType
    : Boolean

  return indices.list.filter(indicesFilter)
}

const search = async (__, args, context) => {
  const { user, elastic, t } = context
  const { after, before, skipLoadRelatedDocs = false } = args
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

  const indicesList = getIndicesList(filter)
  const query = {
    index: indicesList.map(({ name }) => getIndexAlias(name, 'read')),
    from,

    size: first,
    body: createQuery(search, filter, sort, indicesList)
  }

  debug('ES query', JSON.stringify(query))
  const result = await elastic.search(query)
  // debug('result: %O', result)

  const hasNextPage = first > 0 && result.hits.total > from + first
  const hasPreviousPage = from > 0

  const response = {
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

  if (!skipLoadRelatedDocs && (!filter.type || filter.type === 'Document')) {
    await addRelatedDocs({
      connection: response,
      context
    })
  }

  if (SEARCH_TRACK) {
    try {
      const sanitizedResponse = Object.assign({}, response)

      sanitizedResponse.nodes = sanitizedResponse
        .nodes
        .map(node => _.omit(node, ['entity.content', 'entity.contentString']))
        .map(node =>
          _.get(node, 'entity._raw.__type') === 'User'
            ? _.omit(node, ['entity._raw'])
            : node
        )
        .map(node =>
          _.get(node, 'entity.__type') === 'Comment'
            ? _.omit(node, ['entity.votes'])
            : node
        )

      await elastic.index({
        index: getIndexAlias('searches'),
        type: 'Search',
        body: {
          took: result.took,
          user: {
            id: user.id
          },
          options,
          query,
          // response: sanitizedResponse, -> unable to stringify circular
          date: new Date()
        }
      })
    } catch (err) {
      // Log but do not fail
      console.error(err)
    }
  }

  return response
}

module.exports = search
