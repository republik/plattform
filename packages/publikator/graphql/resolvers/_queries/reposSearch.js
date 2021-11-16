const debug = require('debug')('publikator:resolver:query:search')

const {
  Roles: { ensureUserHasRole },
} = require('@orbiting/backend-modules-auth')

const client = require('../../../lib/cache/search')

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

module.exports = async (__, args, context) => {
  ensureUserHasRole(context.user, 'editor')

  debug({ args })

  if (args.last) {
    throw new Error('"last" argument is not implemented')
  }

  const { after, before } = args

  /**
   * If cursors {after} (1) or {before} (2) are provided, their contents
   * replace options provided: Changing search term or {first} won't have
   * any effect.
   */
  const options =
    (after && decodeCursor(after)) || (before && decodeCursor(before)) || args

  const {
    first = 10,
    from = 0,
    search,
    template,
    phases,
    orderBy,
    isTemplate,
    isSeriesMaster,
    isSeriesEpisode,
    publishDateRange,
    // last - "last" parameter is not implemented in search API
  } = options

  const { body } = await client.find(
    {
      first,
      from,
      search,
      template,
      phases,
      orderBy,
      isTemplate,
      isSeriesMaster,
      isSeriesEpisode,
      publishDateRange,
    },
    context,
  )

  const {
    hits: { total, hits },
  } = body
  const totalCount = Number.isFinite(total?.value) ? total.value : total

  const hasNextPage = first > 0 && totalCount > from + first
  const hasPreviousPage = from > 0

  const repos = hits.length
    ? await context.pgdb.publikator.repos.find({ id: hits.map((n) => n._id) })
    : []

  const data = {
    nodes: repos,
    aggregations: body.aggregations,
    totalCount,
    pageInfo: {
      hasNextPage,
      endCursor: hasNextPage
        ? encodeCursor({
            first,
            from: from + first,
            search,
            template,
            phases,
            orderBy,
            isTemplate,
            isSeriesMaster,
            isSeriesEpisode,
            publishDateRange,
          })
        : null,
      hasPreviousPage,
      startCursor: hasPreviousPage
        ? encodeCursor({
            first,
            from: from - first,
            search,
            template,
            phases,
            orderBy,
            isTemplate,
            isSeriesMaster,
            isSeriesEpisode,
            publishDateRange,
          })
        : null,
    },
  }

  return data
}
