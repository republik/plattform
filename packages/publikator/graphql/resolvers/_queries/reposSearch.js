const debug = require('debug')('publikator:resolver:query:search')

const {
  Roles: { ensureUserHasRole },
} = require('@orbiting/backend-modules-auth')

const client = require('../../../lib/cache/search')

const encodeCursor = (payload) => {
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

const decodeCursor = (cursor) => {
  return JSON.parse(Buffer.from(cursor, 'base64').toString())
}

module.exports = async (__, args, context) => {
  ensureUserHasRole(context.user, 'editor')

  debug({ args })

  if (args.last) {
    throw new Error('"last" argument is not implemented')
  }

  // This overwrites parameters passed via "before" cursor
  const before = args.before ? decodeCursor(args.before) : {}
  Object.keys(before).forEach((key) => {
    args[key] = before[key]
  })

  // This overwrites parameters passed via "after" cursor
  const after = args.after ? decodeCursor(args.after) : {}
  Object.keys(after).forEach((key) => {
    args[key] = after[key]
  })

  const {
    first = 10,
    from = 0,
    search,
    template,
    phases,
    orderBy,
    isTemplate,
    publishDateRange,
    // last - "last" parameter is not implemented in search API
  } = args

  const { body } = await client.find(
    {
      first,
      from,
      search,
      template,
      phases,
      orderBy,
      isTemplate,
      publishDateRange,
    },
    context,
  )

  const hasNextPage = first > 0 && body.hits.total > from + first
  const hasPreviousPage = from > 0

  const {
    hits: { hits },
  } = body

  const repos = hits.length
    ? await context.pgdb.publikator.repos.find({ id: hits.map((n) => n._id) })
    : []

  const data = {
    nodes: repos,
    aggregations: body.aggregations,
    totalCount: body.hits.total,
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
            publishDateRange,
          })
        : null,
    },
  }

  return data
}
