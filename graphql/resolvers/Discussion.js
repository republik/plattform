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
  if (comment.comments.nodes.length > 0) {
    const numChildren = comment.comments.nodes.reduce(
      (acc, value) => {
        return acc + measureTree(value)
      },
      0
    )
    comment.comments.totalCount = numChildren
    return numChildren + 1
  } else {
    comment.comments.totalCount = 0
    return 1
  }
}

module.exports = {
  comments: async (discussion, args, { pgdb }) => {
    const comments = await pgdb.public.comments.find({
      discussionId: discussion.id
    })

    const rootComment = {}
    assembleTree(rootComment, comments)
    measureTree(rootComment)

    return rootComment.comments
  }
}
