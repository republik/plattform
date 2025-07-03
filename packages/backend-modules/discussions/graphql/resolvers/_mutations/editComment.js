const slack = require('../../../lib/slack')
const { transform } = require('../../../lib/Comment')
const { contentLength } = require('../Comment')
const Promise = require('bluebird')
const { timeahead } = require('@orbiting/backend-modules-formats')
const userWaitUntil = require('../Discussion/userWaitUntil')

module.exports = async (_, args, context) => {
  const { pgdb, user, t, pubsub, loaders } = context
  const { id, content, tags } = args

  const transaction = await pgdb.transactionBegin()
  try {
    // ensure comment exists and belongs to user
    const comment = await transaction.public.comments.findOne({ id })
    if (!comment) {
      throw new Error(t('api/comment/404'))
    }

    const discussion = await loaders.Discussion.byId.load(comment.discussionId)

    if (!content || !content.trim().length) {
      throw new Error(t('api/comment/empty'))
    }

    if (!comment.userId || comment.userId !== user.id) {
      throw new Error(t('api/comment/notYours'))
    }

    const waitUntil = await userWaitUntil(discussion, null, context)
    if (waitUntil) {
      throw new Error(
            t('api/comment/suspended', {
              timeahead: timeahead(
                t,
                (waitUntil.getTime() - new Date().getTime()) / 1000,
              ),
            }),
          )
    }

    if (discussion.closed) {
      throw new Error(t('api/comment/closed'))
    }

    // prebuild comment
    const unsavedComment = transform.edit({
      content,
      tags,
      now: args.now,
    })

    // ensure comment length is within limit
    if (
      discussion.maxLength &&
      unsavedComment.content.length > discussion.maxLength &&
      (await contentLength(unsavedComment, {}, context)) > discussion.maxLength
    ) {
      throw new Error(
        t('api/comment/tooLong', { maxLength: discussion.maxLength }),
      )
    }

    const newComment = await transaction.public.comments.updateAndGetOne(
      { id: comment.id },
      unsavedComment,
    )

    await transaction.transactionCommit()

    if (newComment) {
      await Promise.all([
        loaders.Comment.byId.clear(comment.id),
        pubsub.publish('comment', {
          comment: {
            mutation: 'UPDATED',
            node: newComment,
          },
        }),
        slack.publishCommentUpdate(newComment, comment, discussion, context),
      ]).catch((e) => {
        console.error(e)
      })
    }

    return newComment
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
