const debug = require('debug')('publikator:resolver:query:search')
const { ascending } = require('d3-array')

const { ensureSignedIn } = require('@orbiting/backend-modules-auth')

const client = require('../../../lib/cache/search')

const ALLOWED_OPTIONS = [
  'first',
  'from',
  'search',
  'template',
  'phases',
  'orderBy',
  'isTemplate',
  'isSeriesMaster',
  'isSeriesEpisode',
  'publishDateRange',
]

const getOptions = (args) => {
  const { after, before } = args

  /**
   * If cursors {after} (1) or {before} (2) are provided, their contents
   * replace options provided: Changing search term or {first} won't have
   * any effect.
   */
  const options =
    (after && decodeCursor(after)) || (before && decodeCursor(before)) || args

  const defaultOptions = {
    first: 10,
    from: 0,
  }

  const result = {
    ...defaultOptions,
    ...Object.keys(options)
      .filter((key) => ALLOWED_OPTIONS.includes(key))
      .reduce((prev, key) => {
        prev[key] = options[key]
        return prev
      }, {}),
  }

  debug('options: %o', result)

  return result
}

const encodeCursor = (payload) => {
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

const decodeCursor = (cursor) => {
  try {
    return JSON.parse(Buffer.from(cursor, 'base64').toString())
  } catch (e) {
    console.warn('failed to parse cursor:', cursor, e)
  }

  return false
}

// append index from elastic hits
const appendHitIndex = (hits) => (repo) => ({
  ...repo,
  __index: hits.findIndex((hit) => hit._id === repo.id),
})

const byIndex = (a, b) => ascending(a.__index, b.__index)

module.exports = async (__, args, context) => {
  const { req } = context
  ensureSignedIn(req)

  debug({ args })

  if (args.last) {
    throw new Error('"last" argument is not implemented')
  }

  const options = getOptions(args)

  const res = await client.find(options, context)

  const { first, from } = options
  const {
    hits: { total, hits },
  } = res
  const totalCount = Number.isFinite(total?.value) ? total.value : total

  const hasNextPage = first > 0 && totalCount > from + first
  const hasPreviousPage = from > 0

  const repos = hits.length
    ? (await context.pgdb.publikator.repos.find({ id: hits.map((n) => n._id) }))
        .map(appendHitIndex(hits))
        .sort(byIndex)
    : []

  const data = {
    nodes: repos,
    aggregations: res.aggregations,
    totalCount,
    pageInfo: {
      hasNextPage,
      endCursor: hasNextPage
        ? encodeCursor({
            ...options,
            from: from + first,
          })
        : null,
      hasPreviousPage,
      startCursor: hasPreviousPage
        ? encodeCursor({
            ...options,
            from: from - first,
          })
        : null,
    },
  }

  return data
}
