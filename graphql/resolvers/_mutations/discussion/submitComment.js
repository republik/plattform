const { Roles } = require('@orbiting/backend-modules-auth')
const hotness = require('../../../../lib/hotness')
const setDiscussionPreferences = require('./lib/setDiscussionPreferences')
const userWaitUntil = require('../../Discussion/userWaitUntil')

module.exports = async (_, args, { pgdb, user, t, pubsub }) => {
  Roles.ensureUserHasRole(user, 'member')

  const userId = user.id
  const {
    id,
    discussionId,
    parentId,
    content,
    discussionPreferences
  } = args

  const transaction = await pgdb.transactionBegin()
  try {
    const discussion = await transaction.public.discussions.findOne({
      id: discussionId
    })
    if (!discussion) {
      throw new Error(t('api/discussion/404'))
    }

    // check if client-side generated ID already exists
    if (id && !!await transaction.public.comments.findFirst({ id })) {
      throw new Error(t('api/comment/id/duplicate'))
    }

    // ensure user is within minInterval
    if (discussion.minInterval) {
      const waitUntil = await userWaitUntil(discussion, null, { pgdb, user })
      if (waitUntil) {
        throw new Error(t('api/comment/tooEarly', {
          waitFor: `${(waitUntil.getTime() - new Date().getTime()) / 1000}s`
        }))
      }
    }

    // ensure comment length is within limit
    if (discussion.maxLength && content.length > discussion.maxLength) {
      throw new Error(t('api/comment/tooLong', { maxLength: discussion.maxLength }))
    }

    let parentIds
    if (parentId) {
      const parent = await transaction.public.comments.findOne({
        id: parentId
      })
      if (!parent) {
        throw new Error(t('api/comment/parent/404'))
      }
      parentIds = [...(parent.parentIds || []), parentId]
    }

    if (discussionPreferences) {
      await setDiscussionPreferences({
        discussionPreferences,
        userId,
        discussion,
        transaction,
        t
      })
    }

    const comment = await transaction.public.comments.insertAndGet({
      ...id ? { id } : { },
      discussionId: discussion.id,
      parentIds,
      userId,
      content,
      hotness: hotness(0, 0, (new Date().getTime()))
    }, {
      skipUndefined: true
    })

    await transaction.transactionCommit()

    await pubsub.publish('comment', { comment: {
      mutation: 'CREATED',
      node: comment
    }})

    return comment
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
