const graphqlFields = require('graphql-fields')
const {
  ascending,
  descending
} = require('d3-array')
const _ = {
  remove: require('lodash/remove')
}

const assembleTree = (comment, comments) => {
  const parentId = comment.id || null
  comment.comments = {
    nodes:
      _.remove(comments, c => c.parentId === parentId)
      .map(c => assembleTree(c, comments))
  }
  return comment
}

const measureTree = comment => {
  const { comments } = comment
  const numChildren = comment.comments.nodes.reduce(
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

const cutTreeX = (comment, maxDepth, depth = -1) => {
  const { comments } = comment
  if (depth === maxDepth) {
    comment.comments = {
      ...comments,
      nodes: [],
      pageInfo: {
        ...comments.pageInfo,
        hasNextPage: comments.totalCount > 0
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
    const {
      parentId,
      orderBy,
      orderDirection = 'DESC'
    } = args
    const maxDepth = meassureDepth(graphqlFields(info))

    const comments = await pgdb.public.comments.find({
      discussionId: discussion.id
    })

    const rootComment = parentId
      ? { id: parentId }
      : {}

    assembleTree(rootComment, comments)
    measureTree(rootComment)

    if (orderBy) {
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
      sortTree(rootComment, compare)
    }

    if (maxDepth != null) {
      cutTreeX(rootComment, -1, maxDepth)
    }

    return rootComment.comments
  }
}
