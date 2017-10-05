
module.exports = {
  comments: async (discussion, args, { pgdb }) => {
    const comments = await pgdb.public.comments.find({
      discussionId: discussion.id
    })

    const rootComments = comments.filter(c => c.parentId === null)

    const assembleTree = comment => {
      comment.comments = {}
      comment.comments.nodes = comments.filter(c => c.parentId === comment.id)
      comment.comments.nodes.forEach(c => assembleTree(c))
    }
    rootComments.forEach(c => assembleTree(c))

    return {
      nodes: rootComments
    }
  }
}
