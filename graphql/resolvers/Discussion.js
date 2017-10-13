const graphqlFields = require('graphql-fields')
const {
  ascending,
  descending
} = require('d3-array')
const _ = {
  remove: require('lodash/remove')
}

// afterId and compare are optional
const assembleTree = (_comment, _comments, afterId, focusId, compare) => {
  let coveredComments = []
  const _assembleTree = (comment, comments, depth = -1) => {
    const parentId = comment.id || null
    comment._depth = depth
    comment.comments = {
      nodes:
        _.remove(comments, c => c.parentId === parentId)
    }
    if (depth === -1 && (afterId || focusId)) {
      comment.comments.nodes = comment.comments.nodes
        .sort(compare)
      if (afterId) {
        const afterIndex = comment.comments.nodes
          .findIndex(c => c.id === afterId)
        comment.comments.nodes = comment.comments.nodes
          .slice(afterIndex + 1)
      }/* else if (focusId) {
        const focusIndex = comment.comments.nodes
          .findIndex( c => c.id === focusId )
        comment.comments.nodes = comment.comments.nodes
          .slice(focusIndex-1, focusIndex+1)
      } */
    }
    comment.comments.nodes = comment.comments.nodes
      .map(c => {
        coveredComments.push(c)
        return c
      })
      .map(c => _assembleTree(c, comments, depth + 1))
    return comment
  }
  _assembleTree(_comment, _comments)
  return coveredComments
}

const measureTree = comment => {
  const { comments } = comment
  const numChildren = comments.nodes.reduce(
    (acc, value) => {
      return acc + measureTree(value)
    },
    0
  )
  comment.comments = {
    ...comments,
    totalCount: numChildren,
    pageInfo: {
      hasNextPage: false,
      endCursor: null
    }
  }
  return numChildren + 1
}

const sortTree = (comment, compare) => {
  const { comments } = comment
  comment.comments = {
    ...comments,
    nodes: comments.nodes.sort((a, b) => compare(a, b))
  }
  if (comments.nodes.length > 0) {
    comments.nodes.forEach(c => sortTree(c, compare))
  }
  return comment
}

const filterTree = (comment, ids, cursorEnv) => {
  if (ids.length === 0) {
    return comment
  }
  const { comments, id } = comment
  if (comments.nodes.length > 0) {
    const nodes = comments.nodes.filter(n => filterTree(n, ids, cursorEnv) > 0)
    const endCursor = comments.nodes.length === nodes.length || nodes.length === 0
      ? null
      : Buffer.from(JSON.stringify({
        ...cursorEnv,
        parentId: id,
        afterId: nodes[nodes.length - 1].id
      })).toString('base64')
    comment.comments = {
      ...comments,
      nodes,
      pageInfo: {
        ...comments.pageInfo,
        hasNextPage: !!endCursor || comments.totalCount > 0,
        endCursor
      }
    }
    return nodes.length > 0 || ids.indexOf(id) > -1
  } else {
    return ids.indexOf(id) > -1
  }
}

const cutTreeX = (comment, maxDepth, depth = -1) => {
  const { comments } = comment
  if (depth === maxDepth) {
    comment.comments = {
      ...comments,
      nodes: [],
      pageInfo: {
        ...comments.pageInfo,
        hasNextPage: comments.pageInfo.hasNextPage || comments.totalCount > 0
      }
    }
  } else {
    comments.nodes.forEach(c => cutTreeX(c, maxDepth, depth + 1))
  }
  return comment
}

const meassureDepth = (fields, depth = 0) => {
  if (fields.nodes && fields.nodes.comments) {
    return meassureDepth(fields.nodes.comments, depth + 1)
  } else {
    return depth
  }
}

module.exports = {
  comments: async (discussion, args, { pgdb }, info) => {
    const maxDepth = meassureDepth(graphqlFields(info))

    const { after } = args
    const options = after
      ? {
        ...args,
        ...JSON.parse(Buffer.from(after, 'base64').toString())
      }
      : args
    const {
      orderBy = 'HOT',
      orderDirection = 'DESC',
      first = 200,
      afterId,
      focusId,
      parentId
    } = options
    /*
    let {
      parentId
    } = options
    */

    // get comments
    const comments = await pgdb.public.comments.find({
      discussionId: discussion.id
    })

    // to get focused comment on top level, make it parentId
    /*
    if (focusId) {
      const focus = comments.find( c => c.id === focusId )
      parentId = focus
        ? focus.parentId
        : parentId
    }
    */

    const rootComment = parentId
      ? { id: parentId }
      : {}

    // prepare sort
    let ascDesc = orderDirection === 'ASC'
      ? ascending
      : descending
    let compare
    if (orderBy === 'DATE') {
      compare = (a, b) => ascDesc(a.createdAt, b.createdAt)
    } else if (orderBy === 'VOTES') {
      compare = (a, b) => ascDesc(a.upVotes - a.downVotes, b.upVotes - b.downVotes)
    } else if (orderBy === 'HOT') {
      compare = (a, b) => ascDesc(a.hottnes, b.hottnes)
    }

    const coveredComments = assembleTree(rootComment, comments, afterId, focusId, compare)
    measureTree(rootComment)
    sortTree(rootComment, compare)

    if (first || focusId) {
      let filterCommentIds

      if (focusId) {
        const focusComment = coveredComments
          .find(c => c.id === focusId)

        const focusLevelComments = coveredComments
          .filter(c => c.parentId === focusComment.parentId && c._depth === focusComment._depth)
          .sort(compare)

        const focusIndex = focusLevelComments
          .findIndex(c => c.id === focusId)

        filterCommentIds = [
          ...focusLevelComments
            .slice(focusIndex - 1, focusIndex + 2),
          ...coveredComments
            .filter(c => c.parentId === focusId)
            .slice(0, 1)
        ]
          .sort(compare)
          .map(c => c.id)
      } else if (first) {
        filterCommentIds = coveredComments
          .filter(c => !maxDepth || c._depth < maxDepth)
          .sort(compare)
          .slice(0, first)
          .map(c => c.id)
      }

      filterTree(rootComment, filterCommentIds, {
        orderBy,
        orderDirection
      })
    }

    if (maxDepth != null) {
      cutTreeX(rootComment, maxDepth)
    }

    return rootComment.comments
  }
}
