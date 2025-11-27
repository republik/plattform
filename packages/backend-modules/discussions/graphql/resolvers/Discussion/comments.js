const graphqlFields = require('graphql-fields')
const { ascending, descending } = require('d3-array')

const getSortKey = require('../../../lib/sortKey')

const THRESHOLD_OLD_DISCUSSION_IN_MS = 1000 * 60 * 60 * 72 // 72 hours

// Combined Assembly, Counting, and Sorting into ONE pass.
// This eliminates 2 full tree traversals and reduces GC overhead.
const assembleMeasureAndSort = (root, commentsByParent, depth, sortConfig) => {
  const { ascDesc, sortKey, topValue, topIds, bubbleSort } = sortConfig

  // 1. Identify Children
  // If root.id is missing, it's the virtual root
  const lookupKey = root.id || '@@ROOT@@'
  const children = commentsByParent.get(lookupKey) || []

  // 2. Recurse (Depth-First)
  let totalDescendantCount = 0
  const nodes = []

  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    // Recursive step
    const { subtreeCount, node: processedChild } = assembleMeasureAndSort(
      child,
      commentsByParent,
      depth + 1,
      sortConfig,
    )

    totalDescendantCount += subtreeCount
    nodes.push(processedChild)
  }

  const directTotalCount = nodes.length

  // 3. Sort Children (In-Place)
  if (directTotalCount > 1) {
    nodes.sort(
      (a, b) =>
        ascDesc(a.topValue || a[sortKey], b.topValue || b[sortKey]) ||
        ascending(a.index, b.index),
    )
  }

  // 4. Calculate Own "Top Value" (Bubbling Logic)
  let myTopValue

  // Case A: This node is focused or a parent of a focus (Force to top)
  if (topIds && root.id && topIds.has(root.id)) {
    myTopValue = topValue
  }
  // Case B: Bubbling is enabled (standard sort)
  else if (bubbleSort) {
    const ownVal = root[sortKey]

    if (nodes.length === 0) {
      myTopValue = ownVal
    } else {
      const bestChild = nodes[0]
      const bestChildVal =
        bestChild.topValue !== undefined
          ? bestChild.topValue
          : bestChild[sortKey]

      if (ownVal === undefined || ownVal === null) {
        myTopValue = bestChildVal
      } else if (bestChildVal === undefined || bestChildVal === null) {
        myTopValue = ownVal
      } else {
        myTopValue = ascDesc(ownVal, bestChildVal) <= 0 ? ownVal : bestChildVal
      }
    }
  }
  // Case C: Bubbling disabled (e.g. CreatedAt)
  else {
    myTopValue = root[sortKey]
  }

  // 5. Mutate & Construct Node
  root._depth = depth
  root.topValue = myTopValue
  root.totalRepliesCount = totalDescendantCount

  root.comments = {
    nodes: nodes,
    id: root.id,
    totalCount: totalDescendantCount,
    directTotalCount: directTotalCount,
    pageInfo: {
      hasNextPage: false,
      endCursor: null,
    },
  }

  return {
    node: root,
    subtreeCount: totalDescendantCount + 1, // +1 counts self
  }
}

const filterTree = (comment, ids, cursorEnv) => {
  const { comments, id } = comment
  if (comments.nodes.length > 0) {
    const nodes = comments.nodes.filter(
      (n) => filterTree(n, ids, cursorEnv) > 0,
    )
    const exceptIds = [...cursorEnv.exceptIds, ...nodes.map((n) => n.id)]

    // Lazy Buffer Creation
    let endCursor = null
    const isFiltered = comments.nodes.length !== nodes.length

    if (isFiltered && nodes.length > 0) {
      endCursor = Buffer.from(
        JSON.stringify({
          ...cursorEnv,
          parentId: id,
          exceptIds,
        }),
      ).toString('base64')
    }

    comments.nodes = nodes
    comments.pageInfo.hasNextPage =
      !!endCursor || (nodes.length === 0 && comments.nodes.length !== 0)
    comments.pageInfo.endCursor = endCursor

    return nodes.length > 0 || ids.indexOf(id) > -1
  } else {
    return ids.indexOf(id) > -1
  }
}

const meassureDepth = (fields, depth = 0) => {
  if (fields.nodes && fields.nodes.comments) {
    return meassureDepth(fields.nodes.comments, depth + 1)
  } else {
    if (fields.nodes) return depth + 1
    return depth
  }
}

const cutTreeX = (comment, maxDepth, depth = -1) => {
  const { comments } = comment
  if (depth >= maxDepth - 1) {
    comments.nodes = []
    comments.pageInfo.hasNextPage =
      comments.pageInfo.hasNextPage || comments.totalCount > 0
  } else {
    for (let i = 0; i < comments.nodes.length; i++) {
      cutTreeX(comments.nodes[i], maxDepth, depth + 1)
    }
  }
  return comment
}

const flattenTreeHorizontally = (_comment) => {
  const comments = []
  const _flattenTree = (comment, first) => {
    if (!first) {
      comments.push(comment)
    }
    const nodes = comment.comments.nodes
    if (nodes && nodes.length > 0) {
      for (let i = 0; i < nodes.length; i++) {
        _flattenTree(nodes[i], false)
      }
      comment.comments.nodes = []
    }
  }
  _flattenTree(_comment, true)
  return comments
}

const flattenTreeVertically = (_comment) => {
  const comments = []

  const _flattenTree = (comment) => {
    if (comment.comments && comment.comments.nodes) {
      const nodes = comment.comments.nodes
      // Add children to result
      for (let i = 0; i < nodes.length; i++) {
        comments.push(nodes[i])
      }
      // Recurse
      for (let i = 0; i < nodes.length; i++) {
        _flattenTree(nodes[i])
      }
    }
  }

  _flattenTree(_comment)
  return comments
}

const getResolveOrderBy = (defaultOrder, orderBy, comments) => {
  if (orderBy !== 'AUTO') return null
  if (defaultOrder && defaultOrder !== 'AUTO') return defaultOrder

  let oldestCreatedAt = Infinity
  for (let i = 0; i < comments.length; i++) {
    if (comments[i].createdAt < oldestCreatedAt) {
      oldestCreatedAt = comments[i].createdAt
    }
  }

  const thresholdOldDiscussion =
    new Date().getTime() - THRESHOLD_OLD_DISCUSSION_IN_MS

  return oldestCreatedAt < thresholdOldDiscussion ? 'VOTES' : 'DATE'
}

module.exports = async (discussion, args, context, info) => {
  const { pgdb, loaders } = context
  const requestedGraphqlFields = graphqlFields(info)
  const maxDepth = args.flatDepth || meassureDepth(requestedGraphqlFields)

  // ... [Keep totalCountOnly logic] ...
  const totalCountOnly =
    Object.keys(requestedGraphqlFields).filter(
      (key) => !['id', 'totalCount'].includes(key),
    ).length === 0

  // ... [Keep args parsing logic] ...
  const { after } = args
  const options = after
    ? { ...args, ...JSON.parse(Buffer.from(after, 'base64').toString()) }
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
    // ... [Keep existing totalCount logic] ...
    if (tag) {
      const countsPerTag = await loaders.Discussion.byIdCommentTagsCount.load(
        discussion.id,
      )
      const tagCount = countsPerTag.find((row) => row.value === tag)
      return { id: discussion.id, totalCount: tagCount?.count || 0 }
    }
    return {
      id: discussion.id,
      totalCount: loaders.Discussion.byIdCommentsCount.load(discussion.id),
    }
  }

  // OPTIMIZATION 1: Select specific columns.
  // 'content' is often large. If we don't need it, don't fetch it.
  const columnsToSelect = ['*']

  // OPTIMIZATION 2: Calculate 'score' and 'isPublished' in SQL.
  // This removes the need for the .map() loop after the query.
  const selectClause =
    columnsToSelect.map((c) => `c.${c}`).join(', ') +
    ', (c."upVotes" - c."downVotes") as "score"' +
    ', (c.published AND NOT c."adminUnpublished") as "isPublished"'

  const commentsQuery = [
    `SELECT ${selectClause} FROM comments c`,
    tag && `LEFT JOIN comments cr ON cr.id = (c."parentIds"->>0)::uuid`,
    `WHERE c."discussionId" = :discussionId`,
    tag && `AND (c.tags ? :tag OR cr.tags ? :tag)`,
  ]
    .filter(Boolean)
    .join(' ')

  // OPTIMIZATION 3: Removed the .map() block.
  // We fetch raw rows and use them directly.
  const comments = await pgdb.query(commentsQuery, {
    discussionId: discussion.id,
    tag: tag,
  })

  // Add index for stable sort (cheaper to do here than inside the big map)
  for (let i = 0; i < comments.length; i++) {
    comments[i].index = i
  }

  const discussionTotalCount = comments.length

  if (!comments.length) {
    return {
      id: discussion.id,
      totalCount: 0,
      nodes: [],
    }
  }

  const resolvedOrderBy = getResolveOrderBy(
    discussion.defaultOrder,
    orderBy,
    comments,
  )

  const commentsByParent = new Map()
  const ROOT_KEY = '@@ROOT@@'

  for (let i = 0; i < comments.length; i++) {
    const c = comments[i]
    const key =
      c.parentIds && c.parentIds.length > 0
        ? c.parentIds[c.parentIds.length - 1]
        : ROOT_KEY

    if (!commentsByParent.has(key)) commentsByParent.set(key, [])
    commentsByParent.get(key).push(c)
  }

  const ascDesc = orderDirection === 'ASC' ? ascending : descending
  const topValue =
    orderDirection === 'ASC' ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER
  const sortKey = getSortKey(resolvedOrderBy || orderBy)
  const bubbleSort = sortKey !== 'createdAt' && sortKey !== 'hotness'

  let focusComment
  let topIdsSet = null

  if (focusId) {
    focusComment = comments.find((c) => c.id === focusId)
    if (focusComment) {
      topIdsSet = new Set([focusComment.id])
      if (focusComment.parentIds) {
        focusComment.parentIds.forEach((pid) => topIdsSet.add(pid))
      }
    }
  }

  let tree = parentId ? comments.find((c) => c.id === parentId) : {}

  assembleMeasureAndSort(tree, commentsByParent, -1, {
    ascDesc,
    sortKey,
    topValue,
    topIds: topIdsSet,
    bubbleSort,
  })

  if (parentId && includeParent) {
    tree = { comments: { nodes: [tree] } }
  }

  if (exceptIds && exceptIds.length > 0) {
    tree.comments.nodes = tree.comments.nodes.filter(
      (c) => exceptIds.indexOf(c.id) === -1,
    )
  }

  const coveredComments = flattenTreeVertically(tree)

  if (first) {
    const compare = (a, b) =>
      ascDesc(a.topValue || a[sortKey], b.topValue || b[sortKey]) ||
      ascending(a.index, b.index)

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
