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
    orderBy = 'DATE',
    orderDirection = 'DESC',
    first: limit = 40,
    offset = 0,
    discussionId,
    discussionIds = [],
    toDepth,
    focusId,
    lastId
  } = options

  if (limit > MAX_LIMIT) {
    throw new Error(t('api/discussion/args/first/tooBig', { max: MAX_LIMIT }))
  }

  discussionIds.push(discussionId)

  const discussions =
    await pgdb.public.discussions.find({
      ...(discussionIds.filter(Boolean).length > 0) && { id: discussionIds },
      ...(discussionIds.filter(Boolean).length === 0) && { hidden: false }
    })

  const numComments = await pgdb.public.comments.count({
    discussionId: discussions.map(d => d.id),
    ...(toDepth >= 0) && { 'depth <=': toDepth },
    published: true,
    adminUnpublished: false
  })

  let sortKey = getSortKey(orderBy)
  // there is no score in the db
  if (sortKey === 'score') {
    sortKey = 'upVotes" - "downVotes'
  }

  const comments = await pgdb.query(`
    SELECT
      *,
      CASE
        WHEN id = :focusId THEN 1
        ELSE 0
      END AS "focus",
      CASE
        WHEN id = :lastId THEN 1
        ELSE 0
      END AS "last"
    FROM
      comments
    WHERE
      ARRAY["discussionId"] && :discussionIds AND
      ${toDepth >= 0 ? '"depth" <= :toDepth AND' : ''}
      "published" = true AND
      "adminUnpublished" = false
    ORDER BY
      "focus" DESC,
      "last" ASC,
      "${sortKey}" ${orderDirection === 'DESC' ? 'DESC' : 'ASC'}
    LIMIT :limit
    OFFSET :offset
  `, {
    discussionIds: discussions.map(d => d.id),
    toDepth,
    focusId: focusId || null,
    lastId: lastId || null,
    limit,
    offset
  })

  const endCursor = (offset + limit) < numComments
    ? Buffer.from(JSON.stringify({
      ...options,
      offset: offset + limit
    })).toString('base64')
    : null

  return {
    id: `${discussionId || 'comments'}${offset || ''}`,
    totalCount: numComments,
    directTotalCount: numComments,
    pageInfo: {
      hasNextPage: !!endCursor,
      endCursor
    },
    nodes: comments,
    focus: focusId && comments.length && focusId === comments[0].id
      ? comments[0]
      : null
  }
}
