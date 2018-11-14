const getSortKey = require('@orbiting/backend-modules-discussions/lib/sortKey')

const MAX_LIMIT = 100
module.exports = async (_, args, context, info) => {
  const {
    pgdb,
    t
  } = context

  const { after } = args
  const options = after
    ? {
      ...args,
      ...JSON.parse(Buffer.from(after, 'base64').toString()),
      first: args.first
    }
    : args
  const {
    orderBy = 'publishedAt',
    orderDirection = 'DESC',
    first: limit = 40,
    offset = 0
  } = options

  if (limit > MAX_LIMIT) {
    throw new Error(t('api/discussion/args/first/tooBig', { max: MAX_LIMIT }))
  }

  const sortKey = getSortKey(orderBy)

  const numComments = await pgdb.public.comments.count()

  const comments = await pgdb.public.comments.find(
    { },
    {
      limit,
      offset,
      orderBy: { [sortKey]: orderDirection }
    }
  )

  const endCursor = (offset + limit) < numComments
    ? Buffer.from(JSON.stringify({
      ...options,
      offset: offset + limit
    })).toString('base64')
    : null

  return {
    id: `comments${offset || ''}`,
    totalCount: numComments,
    directTotalCount: numComments,
    pageInfo: {
      hasNextPage: !!endCursor,
      endCursor
    },
    nodes: comments
  }
}
