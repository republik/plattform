const { ensureUser } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, context) => {
  const {
    submitComment,
  } = require('@orbiting/backend-modules-discussions/lib/Notifications')
  const {
    notifyPublish,
  } = require('@orbiting/backend-modules-publikator/lib/Notifications')

  const { commentId, repoId, simulateAllPossibleSubscriptions } = args
  const { user: me, loaders, t } = context

  ensureUser(me)

  if (!commentId && !repoId) {
    throw new Error('commentId and/or repoId must be specified')
  }

  if (commentId) {
    const comment = await loaders.Comment.byId.load(commentId)
    if (!comment) {
      throw new Error(t('api/comment/404'))
    }
    const discussion = await loaders.Discussion.byId.load(comment.discussionId)
    await submitComment(comment, discussion, context, [me])
  }

  if (repoId) {
    await notifyPublish(repoId, context, me, simulateAllPossibleSubscriptions)
  }

  return true
}
