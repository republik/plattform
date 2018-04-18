const debug = require('debug')('search:documents')

const termCriteriaBuilder = (fieldName) => (value) => ({
  clause: 'must',
  filter: {
    term: { [fieldName]: value }
  }
})

const hasCriteriaBuilder = (fieldName) => (value) => ({
  clause: value ? 'must' : 'must_not',
  filter: {
    exists: {
      field: fieldName
    }
  }
})

const dateRangeCriteriaBuilder = (fieldName) => (range) => ({
  clause: 'must',
  filter: {
    range: {
      [fieldName]: {
        gte: range.from,
        lte: range.to
      }
    }
  }
})

/*
const dateCriteriaBuilder = (fieldName, operator) => (date) => ({
  clause: 'must',
  filter: {
    range: {
      [fieldName]: {
        [operator]: date
      }
    }
  }
})
*/

const filterBuilder = (filterCriterias) => (filter) =>
  Object.keys(filter).reduce((boolFilter, searchFilterFieldName) => {
    const filterValue = filter[searchFilterFieldName]
    const criteria = filterCriterias[searchFilterFieldName]
    if (!criteria) {
      throw new Error(`Missing filter criteria for filter field ${searchFilterFieldName}`)
    }

    const created = criteria(filterValue)
    boolFilter[created.clause] = [...(boolFilter[created.clause] || []), created.filter]
    return boolFilter
  }, {})

const createFilter = filterBuilder({
  // scheduledAt: dateCriteriaBuilder('scheduledAt', 'gte'),
  feed: hasCriteriaBuilder('meta.feed'),
  dossier: termCriteriaBuilder('meta.dossier'),
  format: termCriteriaBuilder('meta.format'),
  template: termCriteriaBuilder('meta.template'),
  userId: termCriteriaBuilder('meta.credits.url'),
  path: termCriteriaBuilder('meta.path'),
  repoId: termCriteriaBuilder('meta.repoId'),
  publishedAt: dateRangeCriteriaBuilder('meta.publishDate'),
  author: termCriteriaBuilder('meta.authors.keyword'),
  seriesMaster: termCriteriaBuilder('meta.seriesMaster'),
  audio: hasCriteriaBuilder('audio', 'meta.audioSource.mp3'),
  discussion: hasCriteriaBuilder('meta.discussionId')
})

const sanitizeFilter = (filter) => ({
  ...filter,
  ...filter.userId
    ? { userId: `/~${filter.userId}` }
    : { }
})

const createQuery = (searchTerm, filter) => ({
  _source: ['meta.*', 'content'],
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
              'contentString'
            ]
          }
        }
        : { match_all: {} },
      filter: {
        bool: createFilter(sanitizeFilter(filter))
      }
    }
  },
  highlight: {
    fields: {
      contentString: {}
    }
  },
  aggs: {
    authors: {
      terms: {
        field: 'meta.authors.keyword'
      }
    },
    dossiers: {
      terms: {
        field: 'meta.dossier'
      }
    },
    formats: {
      terms: {
        field: 'meta.format'
      }
    },
    seriesMasters: {
      terms: {
        field: 'meta.seriesMaster'
      }
    },
    discussions: {
      value_count: {
        field: 'meta.discussionId'
      }
    },
    audios: {
      value_count: {
        field: 'meta.audioSource.mp3'
      }
    }
  }
})

const mapDocumentHit = (hit) => {
  return {
    document: hit._source,
    highlights: (hit.highlight || {}).contentString || [],
    score: hit._score
  }
}

const mapStats = (result) => {
  const aggregations = result.aggregations
  return {
    total: result.hits.total,
    formats: mapAggregation(aggregations.formats),
    audios: aggregations.audios.value,
    dossiers: mapAggregation(aggregations.dossiers),
    discussions: aggregations.discussions.value,
    seriesMasters: mapAggregation(aggregations.seriesMasters),
    authors: mapAggregation(aggregations.authors)
  }
}

const mapAggregation = (aggregation) => {
  return {
    buckets: aggregation.buckets.map((bucket) => ({
      key: bucket.key,
      count: bucket.doc_count
    }))
  }
}

const cleanOptions = (options) => ({
  ...options,
  after: undefined,
  before: undefined
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
    filter = {},
    first = 40,
    from = 0
  } = options

  const query = {
    index: 'documents',
    type: 'document',
    from,
    size: first,
    body: createQuery(search, filter)
  }
  debug('query: %O', query)
  const result = await elastic.search(query)

  const hasNextPage = result.hits.total > from + first
  const hasPreviousPage = from > 0
  return {
    nodes: result.hits.hits.map(mapDocumentHit),
    stats: mapStats(result),
    pageInfo: {
      hasNextPage,
      endCursor: hasNextPage
        ? stringifyOptions({
          ...options,
          from: from + first
        })
        : null,
      hasPreviousPage,
      startCursor: hasPreviousPage
        ? stringifyOptions({
          ...options,
          from: from - first
        })
        : null
    }
  }
}
