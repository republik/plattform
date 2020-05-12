const { Roles } = require('@orbiting/backend-modules-auth')
const slack = require('../../../lib/slack')

module.exports = async (_, args, context) => {
  const {
    id,
    content
  } = args
  const {
    pgdb,
    user: me,
    t,
    loaders,
    pubsub
  } = context

  Roles.ensureUserHasRole(me, 'editor')

  const comment = await loaders.Comment.byId.load(id)
  if (!comment) {
    throw new Error(t('api/comment/404'))
  }
  const discussion = await loaders.Discussion.byId.load(comment.discussionId)

  const newComment = await pgdb.public.comments.updateAndGetOne(
    { id },
    {
      featuredAt: content ? new Date() : null,
      featuredContent: content || null
    }
  )

  await Promise.all([
    loaders.Comment.byId.clear(comment.id),
    pubsub.publish('comment', {
      comment: {
        mutation: 'UPDATED',
        node: newComment
      }
    }),
    slack.publishCommentFeatured(
      me,
      newComment,
      discussion,
      content,
      !!content,
      context
    )
  ])
    .catch(e => {
      console.error(e)
    })

  return newComment
}
