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
  const filterByDiscussionIds = discussionIds.filter(Boolean).length > 0

  const queryWhere = `
    ${filterByDiscussionIds ? 'ARRAY[c."discussionId"] && :discussionIds AND' : ''}
    ${toDepth >= 0 ? 'c."depth" <= :toDepth AND' : ''}
    c."published" = true AND
    c."adminUnpublished" = false
  `
  const queryJoin = filterByDiscussionIds ? '' : `
    JOIN
      discussions d ON
        c."discussionId" = d.id AND
        d.hidden = false
  `

  let sortKey = getSortKey(orderBy)
  // there is no score in the db
  if (sortKey === 'score') {
    sortKey = 'upVotes" - "downVotes'
  }

  const [numComments, comments] = await Promise.all([
    pgdb.queryOneField(`
      SELECT
        COUNT(*)
      FROM
        comments c
      ${queryJoin}
      WHERE
        ${queryWhere}
    `),
    pgdb.query(`
      SELECT
        c.*,
        CASE
          WHEN c.id = :focusId THEN 1
          ELSE 0
        END AS "focus",
        CASE
          WHEN c.id = :lastId THEN 1
          ELSE 0
        END AS "last"
      FROM
        comments c
      ${queryJoin}
      WHERE
        ${queryWhere}
      ORDER BY
        "focus" DESC,
        "last" ASC,
        c."${sortKey}" ${orderDirection === 'DESC' ? 'DESC' : 'ASC'}
      LIMIT :limit
      OFFSET :offset
    `, {
      discussionIds,
      toDepth,
      focusId: focusId || null,
      lastId: lastId || null,
      limit,
      offset
    })
  ])

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
