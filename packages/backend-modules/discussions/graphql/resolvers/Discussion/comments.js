const graphqlFields = require('graphql-fields')
const _ = require('lodash')
const { ascending, descending } = require('d3-array')

const getSortKey = require('../../../lib/sortKey')

const THRESHOLD_OLD_DISCUSSION_IN_MS = 1000 * 60 * 60 * 72 // 72 hours

const assembleTree = (
  comments,
  { parentId = false, includeParent = false },
) => {
  const rootNodes = []

  const ref = comments.reduce((acc, comment, i) => {
    acc[comment.id] = i
    return acc
  }, {})

  comments
    .filter((comment) => {
      const missingParentId = !parentId
      const isCommentParent = comment.id === parentId
      const isCommentParentChid = comment.parentIds?.includes(parentId)

      return missingParentId || isCommentParent || isCommentParentChid
    })
    .forEach((comment) => {
      const isCommentRoot = !comment.parentIds?.length
      const isParentCommentAsRoot = comment.id === parentId

      if (isCommentRoot || isParentCommentAsRoot) {
        rootNodes.push(comment)
        return
      }

      const parentCommentId = comment.parentIds[comment.parentIds.length - 1]
      const parentCommentIndex = ref[parentCommentId]
      const parentComment = comments[parentCommentIndex]

      const nodes = [...(parentComment.comments?.nodes || []), comment]

      parentComment.comments = {
        ...parentComment.comments,
        nodes,
      }
    })

  if (parentId && !includeParent) {
    return rootNodes[0]
  }

  return {
    comments: {
      nodes: rootNodes,
    },
  }
}

const buildConnections = (comment) => {
  const { comments } = comment

  const totalCount =
    comments?.nodes?.reduce(
      (count, comment) => count + buildConnections(comment),
      0,
    ) || 0

  comment.comments = {
    nodes: [],
    ...comments,
    id: comment.id,
    totalCount,
    totalRepliesCount: totalCount,
    directTotalCount: comments?.nodes?.length || 0,
    pageInfo: {
      hasNextPage: false,
      endCursor: null,
    },
  }

  return totalCount + 1
}

// recursively sort tree
// each node with children gets a topValue based on
// node[sortKey] || topChild[topValue] || topChild[sortKey]
// thus topValue bubbles up the tree
// this behaviour can be disabled with the last param set to false
const deepSortTree = (
  comment,
  ascDesc,
  sortKey,
  topValue,
  topIds,
  bubbleSort = true,
) => {
  const { comments } = comment
  if (comments.nodes.length) {
    comments.nodes.forEach((c) =>
      deepSortTree(c, ascDesc, sortKey, topValue, topIds, bubbleSort),
    )
    comment.comments = {
      ...comments,
      nodes: comments.nodes.sort((a, b) =>
        ascDesc(a.topValue || a[sortKey], b.topValue || b[sortKey]),
      ),
    }
    if (
      comment[sortKey] && // root is a fake comment, doesn't have [sortKey]
      (comment.topValue === undefined || comment.topValue === null)
    ) {
      const firstChild = comment.comments.nodes[0]
      comment.topValue =
        topIds && topIds.includes(comment.id)
          ? topValue
          : bubbleSort
          ? [comment[sortKey], firstChild.topValue || firstChild[sortKey]].sort(
              (a, b) => ascDesc(a, b),
            )[0]
          : null
    }
  }
  return comment
}

const filterTree = (comment, ids, cursorEnv) => {
  const { comments, id } = comment
  if (comments.nodes.length) {
    const nodes = comments.nodes.filter(
      (n) => filterTree(n, ids, cursorEnv) > 0,
    )
    const exceptIds = [...cursorEnv.exceptIds, ...nodes.map((n) => n.id)]
    const endCursor =
      comments.nodes.length === nodes.length || nodes.length === 0
        ? null
        : Buffer.from(
            JSON.stringify({
              ...cursorEnv,
              parentId: id,
              exceptIds,
            }),
          ).toString('base64')
    comment.comments = {
      ...comments,
      nodes,
      pageInfo: {
        ...comments.pageInfo,
        hasNextPage:
          !!endCursor || (nodes.length === 0 && comments.nodes.length !== 0),
        endCursor,
      },
    }
    return nodes.length > 0 || ids.indexOf(id) > -1
  } else {
    return ids.indexOf(id) > -1
  }
}

const cutTreeX = (comment, maxDepth, depth = -1) => {
  const { comments } = comment
  if (depth >= maxDepth - 1) {
    comment.comments = {
      ...comments,
      nodes: [],
      pageInfo: {
        ...comments.pageInfo,
        hasNextPage: comments.pageInfo.hasNextPage || comments.totalCount > 0,
      },
    }
  } else {
    comments.nodes.forEach((c) => cutTreeX(c, maxDepth, depth + 1))
  }
  return comment
}

// the returned array has the same order as the tree
// removes nested children
const flattenTreeHorizontally = (_comment) => {
  const comments = []
  const _flattenTree = (comment, first) => {
    if (!first) {
      // exclude root
      comments.push(comment)
    }
    if (comment.comments.nodes.length > 0) {
      comment.comments.nodes.forEach((c) => _flattenTree(c))
      comment.comments.nodes = []
    }
  }
  _flattenTree(_comment, true)
  return comments
}

// in the returned array lower depth comes first
// doesn't remove nested children
const flattenTreeVertically = (_comment) => {
  const comments = []
  const _flattenTree = (comment) => {
    if (comment.comments.nodes.length) {
      comments.push(...comment.comments.nodes)
      comment.comments.nodes.forEach((c) => _flattenTree(c))
    }
  }
  _flattenTree(_comment)
  return comments
}

const meassureDepth = (fields, depth = 0) => {
  if (fields.nodes?.comments?.length) {
    return meassureDepth(fields.nodes.comments, depth + 1)
  } else {
    if (fields.nodes) {
      return depth + 1
    }
    return depth
  }
}

const getResolveOrderBy = (defaultOrder, orderBy, comments) => {
  if (orderBy !== 'AUTO') {
    return null
  }

  if (defaultOrder && defaultOrder !== 'AUTO') {
    return defaultOrder
  }

  const oldestComment = comments?.reduce((oldest, current) => {
    if (!oldest) {
      return current
    }
    return oldest.createdAt < current.createdAt ? oldest : current
  }, false)

  const thresholdOldDiscussion =
    new Date().getTime() - THRESHOLD_OLD_DISCUSSION_IN_MS

  return oldestComment?.createdAt?.getTime() < thresholdOldDiscussion
    ? 'VOTES'
    : 'DATE'
}

module.exports = async (discussion, args, context, info) => {
  const { pgdb, loaders } = context
  const requestedGraphqlFields = graphqlFields(info)
  const maxDepth = args.flatDepth || meassureDepth(requestedGraphqlFields)

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
    `SELECT c.*`,
    `FROM comments c`,
    tag && `LEFT JOIN comments cr ON cr.id = (c."parentIds"->>0)::uuid`,
    `WHERE c."discussionId" = :discussionId`,
    tag && `AND (c.tags @> '"${tag}"' OR cr.tags @> '"${tag}"')`,
  ]
    .filter(Boolean)
    .join(' ')

  // get comments
  const comments = await pgdb
    .query(commentsQuery, { discussionId: discussion.id })
    .then((comments) =>
      comments.map((c) => ({
        // precompute
        ...c,
        score: c.upVotes - c.downVotes,
        isPublished: c.published && !c.adminUnpublished,
      })),
    )

  const discussionTotalCount = comments.length

  if (!comments.length) {
    return {
      id: discussion.id,
      totalCount: 0,
      nodes: [],
    }
  }

  /* 
    AUTO = comments are sorted 
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

  // prepare sort
  const ascDesc = orderDirection === 'ASC' ? ascending : descending
  const topValue =
    orderDirection === 'ASC' ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER
  const bottomValue =
    orderDirection === 'ASC' ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER
  const sortKey = getSortKey(resolvedOrderBy || orderBy)
  const bubbleSort = sortKey !== 'createdAt' && sortKey !== 'hotness' // bubbling values for sort is disabled for createdAt and hotness

  const compare = (
    a,
    b, // topValue set by deepSortTree // index for stable sort
  ) =>
    ascDesc(a.topValue || a[sortKey], b.topValue || b[sortKey]) ||
    ascending(a.index, b.index)

  // put unpublished to bottom
  if (discussion.isBoard) {
    comments.forEach((c) => {
      if (c.depth === 0 && !c.isPublished) {
        c.topValue = bottomValue
      }
    })
  }

  let focusComment
  let topIds
  if (focusId) {
    focusComment = comments.find((c) => c.id === focusId)

    if (focusComment) {
      // topValue used for sorting
      // we assign it here, because focusComment might be a node without
      // children, which deepSortTree doesn't calculate a topValue for
      focusComment.topValue = topValue

      // Assign a topValue to all parents of the focusComment
      // to prevent them from being sliced out due to them not
      // bubbling to the top
      comments.forEach((c) => {
        if (focusComment.parentIds?.includes(c.id)) {
          c.topValue = topValue
        }
      })

      // Set comment (and its parents as topIds), used later for sorting tree and
      // ensuring comment-tree bubbles to the very top.
      topIds = _([focusComment.id])
        .concat(focusComment.parentIds)
        .compact()
        .value()
    }
  }

  const tree = assembleTree(comments, { parentId, includeParent })
  buildConnections(tree)
  deepSortTree(tree, ascDesc, sortKey, topValue, topIds, bubbleSort)

  if (exceptIds) {
    // exceptIds are always on first level
    tree.comments.nodes = tree.comments.nodes.filter(
      (c) => exceptIds.indexOf(c.id) === -1,
    )
  }

  const coveredComments = flattenTreeVertically(tree).map((c, index) => ({
    // remember index for stable sort
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

  // if parentId is given, we return the totalCount of the subtree
  // otherwise it's the totalCount of the whole discussion
  if (!parentId) {
    tree.comments.id = discussion.id
    tree.comments.totalCount = discussionTotalCount
  }

  if (focusComment) {
    // add focus to root CommentConnection
    tree.comments.focus = focusComment
  }

  // return a flat array in the order of the tree
  if (flatDepth) {
    tree.comments.nodes = flattenTreeHorizontally(tree)
  }

  if (resolvedOrderBy) {
    tree.comments.resolvedOrderBy = resolvedOrderBy
  }

  return tree.comments
}
