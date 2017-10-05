
module.exports = {
  comments: async (discussion, args, { pgdb }) => {
    const comments = await pgdb.public.comments.find({
      discussionId: discussion.id
    })

    const rootComments = comments.filter(c => c.parentId === null)

    const assembleTree = comment => {
      /*
      comment.comments = {
        nodes: comments
          .filter(c => c.parentId === comment.id)
          .forEach(c => assembleTree(c))
      }
      */
      comment.comments = {
        nodes: []
      }
      comment.comments.nodes = comments.filter(c => c.parentId === comment.id)
      comment.comments.nodes.forEach(c => assembleTree(c))
    }
    rootComments.forEach(c => assembleTree(c))

    const measureTree = comment => {
      if (comment.comments.nodes.length > 0) {
        const numChildren = comment.comments.nodes.reduce(
          (acc, value) => {
            return acc + measureTree(value)
          },
          0
        )
        comment.comments.totalCount = numChildren
        return numChildren+1
      } else {
        comment.comments.totalCount = 0
        return 1
      }
    }
    const rootComment = {
      comments: {
        totalCount: 0,
        nodes: rootComments
      }
    }
    measureTree(rootComment)


    //console.log(util.inspect(rootComment, {depth: null}))

    return rootComment.comments
  }
}
