const getSortKey = require('../../../lib/sortKey')

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
    offset = 0,
    discussionId
  } = options

  if (limit > MAX_LIMIT) {
    throw new Error(t('api/discussion/args/first/tooBig', { max: MAX_LIMIT }))
  }

  let sortKey = getSortKey(orderBy)
  if (sortKey === 'score') {
    sortKey = '"upVotes" - "downVotes"'
  }

  const numComments = await pgdb.public.comments.count(
    { discussionId },
    { skipUndefined: true }
  )

  const comments = await pgdb.public.comments.find(
    {
      discussionId
    },
    {
      limit,
      offset,
      orderBy: { [sortKey]: orderDirection },
      skipUndefined: true
    }
  )

  const endCursor = (offset + limit) < numComments
    ? Buffer.from(JSON.stringify({
      ...options,
      offset: offset + limit
    })).toString('base64')
    : null

  return {
    id: `${discussionId || 'comments'}{offset || ''}`,
    totalCount: numComments,
    directTotalCount: numComments,
    pageInfo: {
      hasNextPage: !!endCursor,
      endCursor
    },
    nodes: comments
  }
}
