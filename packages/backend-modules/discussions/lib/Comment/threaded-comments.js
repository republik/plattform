const THRESHOLD_OLD_DISCUSSION_IN_MS = 1000 * 60 * 60 * 72 // 72 hours

const ROOT_KEY = '@@ROOT@@'

const buildNode = (parent, depth, commentsByParent) => {
  parent._depth = depth

  const lookupKey = parent.id || ROOT_KEY
  const children = commentsByParent.get(lookupKey) || []

  // Assign children and recurse
  parent.comments = {
    nodes: children.map((c) => buildNode(c, depth + 1, commentsByParent)),
  }

  return parent
}

const assembleTree = (root, allComments) => {
  const commentsByParent = new Map()

  for (let i = 0; i < allComments.length; i++) {
    const c = allComments[i]
    let key

    if (!c.parentIds || c.parentIds.length === 0) {
      key = ROOT_KEY
    } else {
      key = c.parentIds[c.parentIds.length - 1]
    }

    if (!commentsByParent.has(key)) {
      commentsByParent.set(key, [])
    }
    commentsByParent.get(key).push(c)
  }

  buildNode(root, -1, commentsByParent)
}

const measureTree = (comment) => {
  const { comments } = comment

  let numChildren = 0
  if (comments && comments.nodes && comments.nodes.length > 0) {
    for (const child of comments.nodes) {
      numChildren += measureTree(child)
    }
  }

  comment.comments = {
    ...comments,
    id: comment.id,
    totalCount: numChildren,
    directTotalCount: comments.nodes?.length || 0,
    pageInfo: {
      hasNextPage: false,
      endCursor: null,
    },
  }
  comment.totalRepliesCount = numChildren
  return numChildren + 1
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
  if (comments.nodes.length > 0) {
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
  if (comments.nodes.length > 0) {
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
        hasNextPage: comments.pageInfo?.hasNextPage || comments.totalCount > 0,
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
    if (comment?.comments?.nodes?.length > 0) {
      for (let i = 0; i < comment.comments.nodes.length; i++) {
        comments.push(comment.comments.nodes[i])
      }
      comment.comments.nodes.forEach((c) => _flattenTree(c))
    }
  }
  _flattenTree(_comment)
  return comments
}

const measureDepth = (fields, depth = 0) => {
  if (fields.nodes?.comments) {
    return measureDepth(fields.nodes.comments, depth + 1)
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

  // OPTIMIZATION: Use standard iteration instead of reduce to find min
  let oldestComment = comments[0]
  for (let i = 1; i < comments.length; i++) {
    if (comments[i].createdAt < oldestComment.createdAt) {
      oldestComment = comments[i]
    }
  }

  const thresholdOldDiscussion =
    new Date().getTime() - THRESHOLD_OLD_DISCUSSION_IN_MS

  return oldestComment?.createdAt?.getTime() < thresholdOldDiscussion
    ? 'VOTES'
    : 'DATE'
}

module.exports = {
  assembleTree,
  cutTreeX,
  deepSortTree,
  filterTree,
  flattenTreeHorizontally,
  flattenTreeVertically,
  getResolveOrderBy,
  measureDepth,
  measureTree,
}
