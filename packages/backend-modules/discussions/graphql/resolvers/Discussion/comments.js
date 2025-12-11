const graphqlFields = require('graphql-fields')
const { ascending, descending } = require('d3-array')
const {
  assembleTree,
  cutTreeX,
  deepSortTree,
  filterTree,
  flattenTreeHorizontally,
  flattenTreeVertically,
  getResolveOrderBy,
  measureDepth,
  measureTree,
} = require('../../../lib/Comment/threaded-comments')
const getSortKey = require('../../../lib/sortKey')

module.exports = async (discussion, args, context, info) => {
  const { pgdb, loaders } = context
  const requestedGraphqlFields = graphqlFields(info)
  const maxDepth = args.flatDepth || measureDepth(requestedGraphqlFields)

  const totalCountOnly =
    Object.keys(requestedGraphqlFields).filter(
      (key) => !['id', 'totalCount'].includes(key),
    ).length === 0

  const { after } = args
  const options = after
    ? {
        ...args,
        ...JSON.parse(Buffer.from(after, 'base64').toString()),
      }
    : args
  const {
    orderBy = 'AUTO',
    orderDirection = 'DESC',
    first = 200,
    exceptIds = [],
    focusId,
    parentId,
    includeParent = false,
    flatDepth,
    tag: _tag,
  } = options

  const tag = discussion.tags?.includes(_tag) && _tag

  if (totalCountOnly) {
    if (tag) {
      const countsPerTag = await loaders.Discussion.byIdCommentTagsCount.load(
        discussion.id,
      )
      const tagCount = countsPerTag.find((row) => row.value === tag)
      return {
        id: discussion.id,
        totalCount: tagCount?.count || 0,
      }
    }
    return {
      id: discussion.id,
      totalCount: loaders.Discussion.byIdCommentsCount.load(discussion.id),
    }
  }

  const commentsQuery = [
    `SELECT
    c.*,
    (c."upVotes" - c."downVotes") as score,
    (c.published AND NOT c."adminUnpublished") as "isPublished"
    FROM comments c`,
    tag && `LEFT JOIN comments cr ON cr.id = (c."parentIds"->>0)::uuid`,
    `WHERE c."discussionId" = :discussionId`,
    tag && `AND (c.tags ? :tag OR cr.tags ? :tag)`,
  ]
    .filter(Boolean)
    .join(' ')

  const comments = await pgdb.query(commentsQuery, {
    discussionId: discussion.id,
    tag: tag,
  })

  const discussionTotalCount = comments.length

  if (!comments.length) {
    return {
      id: discussion.id,
      totalCount: 0,
      nodes: [],
    }
  }

  /* AUTO = comments are sorted
    - by date if the first comment was created in the last 72 hours
    - or by votes otherwise
    - this can be overruled by defaultOrder flag
    the property resolvedOrderBy is just needed when DiscussionOrder === AUTO
  */
  const resolvedOrderBy = getResolveOrderBy(
    discussion.defaultOrder,
    orderBy,
    comments,
  )

  let tree = parentId ? comments.find((c) => c.id === parentId) : {}

  // prepare sort
  const ascDesc = orderDirection === 'ASC' ? ascending : descending
  const topValue =
    orderDirection === 'ASC' ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER
  const sortKey = getSortKey(resolvedOrderBy || orderBy)
  const bubbleSort = sortKey !== 'createdAt' && sortKey !== 'hotness' // bubbling values for sort is disabled for createdAt and hotness

  const compare = (
    a,
    b, // topValue set by deepSortTree // index for stable sort
  ) =>
    ascDesc(a.topValue || a[sortKey], b.topValue || b[sortKey]) ||
    ascending(a.index, b.index)

  let focusComment
  let topIds
  if (focusId) {
    focusComment = comments.find((c) => c.id === focusId)

    if (focusComment) {
      focusComment.topValue = topValue

      // Assign a topValue to all parents of the focusComment
      // to prevent them from being sliced out due to them not
      // bubbling to the top
      comments.forEach((c) => {
        if (focusComment.parentIds?.includes(c.id)) {
          c.topValue = topValue
        }
      })

      topIds = [focusComment.id]
      if (focusComment.parentIds) {
        topIds = topIds.concat(focusComment.parentIds)
      }
      topIds = topIds.filter(Boolean)
    }
  }

  assembleTree(tree, comments)

  if (parentId && includeParent) {
    tree = { comments: { nodes: [tree] } }
  }

  measureTree(tree)
  deepSortTree(tree, ascDesc, sortKey, topValue, topIds, bubbleSort)

  if (exceptIds && exceptIds.length > 0) {
    // exceptIds are always on first level
    tree.comments.nodes = tree.comments.nodes.filter(
      (c) => exceptIds.indexOf(c.id) === -1,
    )
  }

  const coveredComments = flattenTreeVertically(tree).map((c, index) => ({
    ...c,
    index,
  }))

  if (first) {
    let filterComments = coveredComments.sort(compare)
    if (maxDepth != null) {
      const maxDepthAbsolute =
        parentId && tree.comments && tree.comments.nodes[0]
          ? tree.comments.nodes[0].depth + maxDepth
          : maxDepth
      filterComments = filterComments.filter((c) => c.depth < maxDepthAbsolute)
    }
    filterComments = filterComments.slice(0, first)

    const filterCommentIds = filterComments.map((c) => c.id)

    filterTree(tree, filterCommentIds, {
      orderBy,
      orderDirection,
      exceptIds,
    })
  }

  if (maxDepth != null) {
    cutTreeX(tree, maxDepth)
  }

  if (!parentId) {
    tree.comments.id = discussion.id
    tree.comments.totalCount = discussionTotalCount
  }

  if (focusComment) {
    tree.comments.focus = focusComment
  }

  if (flatDepth) {
    tree.comments.nodes = flattenTreeHorizontally(tree)
  }

  if (resolvedOrderBy) {
    tree.comments.resolvedOrderBy = resolvedOrderBy
  }

  return tree.comments
}
