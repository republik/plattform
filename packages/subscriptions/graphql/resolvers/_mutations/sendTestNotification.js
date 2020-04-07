const { ensureUser } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, context) => {
  const { submitComment } = require('@orbiting/backend-modules-discussions/lib/Notifications')
  const { notifyPublish } = require('../../../../../servers/publikator/lib/Notifications')

  const {
    commentId,
    docRepoId
  } = args
  const {
    user: me,
    loaders,
    t
  } = context

  ensureUser(me)

  if (!commentId && !docRepoId) {
    throw new Error('commentId and/or docRepoId must be specified')
  }

  if (commentId) {
    const comment = await loaders.Comment.byId.load(commentId)
    if (!comment) {
      throw new Error(t('api/comment/404'))
    }
    const discussion = await loaders.Discussion.byId.load(comment.discussionId)
    await submitComment(
      comment,
      discussion,
      context,
      [me]
    )
  }

  if (docRepoId) {
    await notifyPublish(
      docRepoId,
      context,
      [me]
    )
  }

  return true
}
