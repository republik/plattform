const debug = require('debug')('publikator:cache:search')

import { GraphqlContext } from '@orbiting/backend-modules-types'

const utils = require('@orbiting/backend-modules-search/lib/utils')

import { getPhases } from '../../lib/phases'

type OrderFieldKey = 'CREATED_AT' | 'NAME' | 'PUSHED_AT' | 'UPDATED_AT'

// see https://developer.github.com/v4/enum/repositoryorderfield/
const OrderFields: Record<OrderFieldKey, string> = {
  CREATED_AT: 'createdAt',
  NAME: 'name.keyword',
  PUSHED_AT: 'commit.createdAt',
  UPDATED_AT: 'updatedAt',
  // 'STARGAZERS' is not implemented. Keeping in sync is hard.
}

type SortorderArgs = {
  orderBy?: { field: OrderFieldKey; direction?: 'asc' | 'desc' }
}

const getSort = (args: SortorderArgs) => {
  // Default sorting
  if (!args.orderBy) {
    return
  }

  const field = OrderFields[args.orderBy.field]

  if (!field) {
    throw new Error(
      `Unable to order by "${args.orderBy.field}", probably missing or not implemented.`,
    )
  }

  return {
    sort: {
      [field]: args.orderBy.direction
        ? args.orderBy.direction.toLowerCase()
        : 'asc', // Default direction if not available.
    },
  }
}

const getSourceFilter = () => ({
  _source: {
    excludes: ['*'],
  },
})

const applyRolebasedFilter = (query: any, context: GraphqlContext) => {
  const phases = getPhases()
    .filter((phase) => phase.predicates?.canAccess?.(context))
    .map((phase) => phase.key)

  query.bool.must.push({ terms: { 'currentPhase.keyword': phases } })
}

const find = async (args: any, context: GraphqlContext) => {
  const { elastic } = context
  debug('args: %o', args)

  const fields = [
    'id',
    // 'commit.strings.text',
    'commit.meta.title',
    'commit.strings.title',
    'commit.strings.lead',
    'commit.strings.credits',
  ]

  const query: any = {
    bool: {
      must: [],
      must_not: [{ exists: { field: 'archivedAt' } }],
    },
  }

  if ([true, false].includes(args.isTemplate)) {
    query.bool[args.isTemplate ? 'must' : 'must_not'].push({
      term: { 'meta.isTemplate': true },
    })
  }

  if ([true, false].includes(args.isSeriesMaster)) {
    query.bool[args.isSeriesMaster ? 'must' : 'must_not'].push({
      exists: { field: 'commit.meta.seriesMaster' },
    })
  }

  if ([true, false].includes(args.isSeriesEpisode)) {
    query.bool[args.isSeriesEpisode ? 'must' : 'must_not'].push({
      exists: { field: 'commit.meta.seriesEpisode' },
    })
  }

  if (args.id) {
    query.bool.must.push({ term: { _id: args.id } })
  }

  if (args.search) {
    query.bool.must.push({
      simple_query_string: {
        query: args.search,
        fields,
        default_operator: 'AND',
      },
    })
  }

  if (args.template) {
    query.bool.must.push({
      term: { 'commit.meta.template': args.template },
    })
  }

  if (args.phases?.length) {
    query.bool.must.push({ terms: { 'currentPhase.keyword': args.phases } })
  }

  if (args.publishDateRange) {
    query.bool.must.push({
      range: {
        'meta.publishDate': {
          gte: args.publishDateRange.from,
          lt: args.publishDateRange.until,
        },
      },
    })
  }

  applyRolebasedFilter(query, context)

  const aggs = {
    phases: {
      terms: {
        field: 'currentPhase.keyword',
        min_doc_count: 0,
        size: getPhases().length,
      },
    },
  }

  return elastic.search({
    index: utils.getIndexAlias('repo', 'read'),
    from: args.from,
    size: args.first,
    track_total_hits: true,
    body: {
      ...getSort(args),
      ...getSourceFilter(),
      query,
      aggs,
    },
  })
}

module.exports = {
  find,
}
