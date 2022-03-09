const debug = require('debug')('search:graphql:resolvers:_queries:search')
const {
  Roles: { userHasRole },
} = require('@orbiting/backend-modules-auth')
const {
  isUserUnrestricted,
  includesUnrestrictedChildRepoId,
} = require('@orbiting/backend-modules-documents/lib/restrictions')
const {
  schema: documentSchema,
  addRelatedDocs,
} = require('../../../lib/Documents')
const { schema: documentZoneSchema } = require('../../../lib/DocumentZones')
const { encodeCursor, getOptions } = require('../../../lib/options')
const {
  filterReducer,
  getFilterValue,
  getFilterObj,
  elasticFilterBuilder,
} = require('../../../lib/filters')
const { extractAggs } = require('../../../lib/aggregations')
const { createSort } = require('../../../lib/sort')
const { __resolveType: resolveHitType } = require('../SearchEntity')
const { transformUser } = require('@orbiting/backend-modules-auth')

const _ = require('lodash')
const { v4: uuid } = require('uuid')

const indices = require('../../../lib/indices')
const { getIndexAlias } = require('../../../lib/utils')

const reduceFilters = filterReducer([documentSchema, documentZoneSchema])
const createElasticFilter = elasticFilterBuilder([
  documentSchema,
  documentZoneSchema,
])
const schemaAggregations = extractAggs([documentSchema, documentZoneSchema])

const getFieldList = require('@orbiting/graphql-list-fields')

const createCache = require('../../../lib/cache')

const DEV = process.env.NODE_ENV ? process.env.NODE_ENV !== 'production' : true

const FUZZINESS_WORD_LENGTH_THRESHOLD = 5

const deepMergeArrays = function (objValue, srcValue) {
  if (_.isArray(objValue)) {
    return objValue.concat(srcValue)
  }
}

const getSimpleQueryStringQuery = (searchTerm) => {
  const sanitizedSearchTerm = searchTerm.trim()

  if (sanitizedSearchTerm.match(/[+|\-"*()~]/g)) {
    return sanitizedSearchTerm
  }

  // split search term and stitch together with fuzzy per word
  const fuzzySearchTerm = sanitizedSearchTerm
    .split(/\s/)
    .map((term) => {
      if (term.length >= FUZZINESS_WORD_LENGTH_THRESHOLD * 2) {
        return `${term}~2`
      } else if (term.length >= FUZZINESS_WORD_LENGTH_THRESHOLD) {
        return `${term}~1`
      }

      return term
    })
    .join(' ')

  debug('getSimpleQueryStringQuery', {
    searchTerm,
    sanitizedSearchTerm,
    fuzzySearchTerm,
  })

  return `(${sanitizedSearchTerm}) | ("${sanitizedSearchTerm}") | (${fuzzySearchTerm})`
}

const createShould = function (
  searchTerm,
  searchFilter,
  indicesList,
  user,
  scheduledAt,
  ignorePrepublished,
) {
  const queries = []

  // A query for each ES index
  indicesList.forEach(({ type, index, search }) => {
    let must = {
      match_all: {},
    }

    let fields = Object.keys(search.termFields)

    // Append boost if available, annotation "<field name>^<boost>"
    fields = fields.map((field) => {
      const boost = search.termFields[field].boost
      if (boost) {
        return `${field}^${boost}`
      }

      return field
    })

    if (searchTerm) {
      const query = {
        simple_query_string: {
          query: getSimpleQueryStringQuery(searchTerm),
          fields,
          default_operator: 'AND',
        },
      }

      must = [
        query,
        search.functionScore && { function_score: search.functionScore(query) },
      ].filter(Boolean)
    }

    const rolebasedFilterArgs = Object.assign(
      {},
      { scheduledAt, ignorePrepublished },
      getFilterObj(searchFilter),
    )

    const rolebasedFilterDefault = _.get(
      search,
      'rolebasedFilter.default',
      () => ({}),
    )(rolebasedFilterArgs)

    const rolebasedFilter = Object.assign({}, rolebasedFilterDefault)

    if (userHasRole(user, 'editor')) {
      Object.assign(
        rolebasedFilter,
        _.get(
          search,
          'rolebasedFilter.editor',
          () => rolebasedFilterDefault,
        )(rolebasedFilterArgs),
      )
    }

    const filter = _.mergeWith(
      {},
      search.filter.default(searchFilter),
      createElasticFilter(searchFilter),
      rolebasedFilter,
      deepMergeArrays,
    )

    debug('filter', JSON.stringify(filter, null, 2))

    queries.push({
      bool: {
        must,
        filter,
      },
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
        fields[field] = {
          ...search.termFields[field].highlight,
          order: 'score',
        }
      }
    })
  })

  return { fields }
}

const defaultExcludes = ['contentString', 'resolved']
const createQuery = (
  searchTerm,
  filter,
  sort,
  indicesList,
  user,
  scheduledAt,
  withoutChildren,
  withoutAggs,
  ignorePrepublished,
) => ({
  query: {
    bool: {
      should: createShould(
        searchTerm,
        filter,
        indicesList,
        user,
        scheduledAt,
        ignorePrepublished,
      ),
    },
  },
  sort: createSort(sort),
  highlight: createHighlight(indicesList),
  stored_fields: ['contentString.count'],
  ...(withoutAggs ? {} : { aggs: schemaAggregations }),
  _source: {
    excludes: [
      ...defaultExcludes,
      ...(withoutChildren ? ['content.children'] : []),
    ],
  },
})

const mapHit = (hit) => {
  const type = resolveHitType(hit._source)
  const entity = type === 'User' ? transformUser(hit._source) : hit._source

  Object.assign(entity, { _storedFields: hit.fields })

  const highlights = []
  Object.keys(hit.highlight || {}).forEach((path) => {
    highlights.push({ path, fragments: hit.highlight[path] })
  })

  return {
    entity,
    highlights,
    score: hit._score,
    type,
  }
}

const transformTermsAgg = (key, agg, t) => ({
  key,
  label: t(`api/search/aggs/${key}`, { key }, !DEV ? key : undefined),
  buckets: agg.terms.buckets.map((bucket) => ({
    label: t(
      `api/search/aggs/${key}/${bucket.key}`,
      { key, value: bucket.key, count: bucket.doc_count },
      !DEV ? bucket.key : undefined,
    ),
    value: bucket.key,
    count: bucket.doc_count,
  })),
})

const transformCountAgg = (key, agg, t) => ({
  key,
  label: t(`api/search/aggs/${key}`, { key }, !DEV ? key : undefined),
  count: agg.count ? agg.count.value : agg.doc_count,
})

const transformRangeAgg = (key, agg, t) => ({
  key,
  label: t(`api/search/aggs/${key}`, { key }, !DEV ? key : undefined),
  count: agg.doc_count,
  buckets: agg.ranges.buckets.map((bucket) => ({
    label: t(
      `api/search/aggs/${key}/${bucket.key}`,
      { key, value: bucket.key, count: bucket.doc_count },
      !DEV ? bucket.key : undefined,
    ),
    value: bucket.key,
    count: bucket.doc_count,
  })),
})

const mapAggregations = (result, t) => {
  const aggregations = result.aggregations
  if (!aggregations) {
    return []
  }
  return Object.keys(aggregations).map((name) => {
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

const MAX_NODES = 10000 // Limit, but exceedingly high

const getFirst = (first, filter, user, recursive, forceUnrestricted) => {
  // we only restrict the nodes array
  // making totalCount always available
  // querying a single document by path is always allowed
  const path = getFilterValue(filter, 'path')

  const repoId = getFilterValue(filter, 'repoId')
  const oneRepoId = repoId && (!Array.isArray(repoId) || repoId.length === 1)

  const format = getFilterValue(filter, 'format')
  const unrestricted = includesUnrestrictedChildRepoId(format)

  if (
    !isUserUnrestricted(user) &&
    !recursive &&
    !path &&
    !oneRepoId &&
    !unrestricted &&
    !forceUnrestricted
  ) {
    return 0
  }

  if (first > MAX_NODES) {
    return MAX_NODES
  }

  return first
}

const getIndicesList = (filter) => {
  const limitType = getFilterValue(filter, 'type')
  const typeFilter = limitType ? ({ type }) => type === limitType : Boolean
  const searchableFilter = ({ searchable = true }) => searchable

  return indices.list.filter(typeFilter).filter(searchableFilter)
}

const hasFieldRequested = (fieldName, GraphQLResolveInfo) => {
  const fields = getFieldList(GraphQLResolveInfo, true)
  return !!fields.find(
    (field) =>
      field === fieldName || field.split('.').find((f) => f === fieldName),
  )
}

const search = async (__, args, context, info) => {
  const { user, elastic, t, redis } = context
  const cache = createCache(redis)

  const {
    recursive = false,
    unrestricted = false,
    scheduledAt,
    ignorePrepublished,
    trackingId = uuid(),
    withoutContent: _withoutContent,
    withoutRelatedDocs = false,
    withoutAggs = false,
  } = args

  // detect if Document.content is requested
  let withoutContent = _withoutContent || false
  let withoutChildren = withoutContent
  if (info && _withoutContent === undefined) {
    withoutContent = !hasFieldRequested('content', info)
    withoutChildren = withoutContent && !hasFieldRequested('children', info)
  }

  const options = getOptions(args, context)
  const {
    search,
    filter: filterObj,
    filters: filterArray,
    sort,
    first: _first,
    from,
    samples,
  } = options

  /**
   * {filterObj} is a shorthand for adding items to {filterArray}.
   *
   * Here we iterate through {filterObj} props, transform them into a
   * filter item (key, value, not) and append them to {filterArray}. It
   * will no append a filter item if present already.
   */
  Object.keys(filterObj).forEach((key) => {
    const value = filterObj[key]
    const not = false

    const hasFilter = !!filterArray.find(
      (f) =>
        f.key === key &&
        JSON.stringify(f.value) === JSON.stringify(value) &&
        f.not === not,
    )

    if (!hasFilter) {
      filterArray.push({ key, value, not })
    }
  })

  const filter = reduceFilters(filterArray)

  const first =
    (samples !== false && samples) ||
    getFirst(_first, filter, user, recursive, unrestricted)

  const indicesList = getIndicesList(filter)
  const query = {
    index: indicesList.map(({ name }) => getIndexAlias(name, 'read')),
    from,
    size: first,
    track_total_hits: true,
    body: createQuery(
      search,
      filter,
      sort,
      indicesList,
      user,
      scheduledAt,
      withoutChildren,
      withoutAggs,
      ignorePrepublished,
    ),
  }
  debug('ES query', JSON.stringify(query))

  let result = await cache.get(query)
  if (!result) {
    const { body } = await elastic.search(query)
    result = body
    // no reason to await cache priming
    cache.set(query, result, options)
  }

  const { total } = result.hits
  const totalCount = Number.isFinite(total?.value) ? total.value : total

  const hasNextPage =
    samples !== false ? false : first > 0 && totalCount > from + first
  const hasPreviousPage = samples !== false ? false : from > 0

  const response = {
    nodes: result.hits.hits.map(mapHit),
    aggregations: mapAggregations(result, t),
    totalCount,
    pageInfo: {
      hasNextPage,
      endCursor: hasNextPage
        ? encodeCursor({
            ...options,
            filters: filterArray,
            first,
            from: from + first,
          })
        : null,
      hasPreviousPage,
      startCursor: hasPreviousPage
        ? encodeCursor({
            ...options,
            filters: filterArray,
            first,
            from: from - first,
          })
        : null,
    },
    trackingId,
  }

  if (
    !recursive &&
    !withoutRelatedDocs &&
    (!filter.type || filter.type === 'Document')
  ) {
    await addRelatedDocs({
      connection: response,
      context,
      withoutContent,
    })
  }

  return response
}

module.exports = search
