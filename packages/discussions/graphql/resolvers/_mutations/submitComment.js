const { Roles } = require('@orbiting/backend-modules-auth')
const hotness = require('../../../lib/hotness')
const setDiscussionPreferences = require('../../../lib/setDiscussionPreferences')
const userCanComment = require('../Discussion/userCanComment')
const userWaitUntil = require('../Discussion/userWaitUntil')
const slack = require('../../../lib/slack')
const { timeahead } = require('@orbiting/backend-modules-formats')

const { submitComment: notify } = require('../../../lib/Notifications')

module.exports = async (_, args, context) => {
  const {
    pgdb,
    loaders,
    user,
    t,
    pubsub
  } = context
  const userId = user.id

  Roles.ensureUserHasRole(user, 'member')

  const {
    id,
    discussionId,
    parentId,
    content,
    discussionPreferences,
    tags
  } = args

  if (!content || !content.trim().length) {
    throw new Error(t('api/comment/empty'))
  }

  const transaction = await pgdb.transactionBegin()
  try {
    const discussion = await loaders.Discussion.byId.load(discussionId)
    if (!discussion) {
      throw new Error(t('api/discussion/404'))
    }

    // check if client-side generated ID already exists
    if (id && !!await loaders.Comment.byId.load(id)) {
      throw new Error(t('api/comment/id/duplicate'))
    }

    if (discussion.closed) {
      throw new Error(t('api/comment/closed'))
    }

    const canComment = await userCanComment(discussion, null, context)
    if (!canComment) {
      throw new Error(t('api/comment/canNotComment'))
    }

    // ensure user is within minInterval
    const waitUntil = await userWaitUntil(discussion, null, { pgdb, user })
    if (waitUntil) {
      throw new Error(t('api/comment/tooEarly', {
        timeahead: timeahead(t, (waitUntil.getTime() - new Date().getTime()) / 1000)
      }))
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

    // check tags
    if (!parentId && discussion.tagRequired && (!tags || tags.length === 0)) {
      throw new Error(t('api/comment/tagRequired'))
    }
    if (tags && tags.length) {
      const invalidTags = tags
        .filter(tc => !discussion.tags.find(td => tc === td))
      if (invalidTags.length) {
        throw new Error(t('api/comment/invalidTags', { invalidTags: invalidTags.join(',') }))
      }
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
      depth: (parentIds && parentIds.length) || 0,
      userId,
      content,
      hotness: hotness(0, 0, (new Date().getTime())),
      tags
    }, {
      skipUndefined: true
    })

    try {
      await notify(comment, discussion, context)
    } catch (e) {
      console.warn(e)
    }

    await transaction.transactionCommit()

    await pubsub.publish('comment', { comment: {
      mutation: 'CREATED',
      node: comment
    } })

    slack.publishComment(comment, discussion, context)

    return comment
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
