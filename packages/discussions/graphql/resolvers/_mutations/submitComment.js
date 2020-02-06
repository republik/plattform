const { Roles } = require('@orbiting/backend-modules-auth')
const { transform } = require('../../../lib/Comment')
const setDiscussionPreferences = require('../../../lib/setDiscussionPreferences')
const userCanComment = require('../Discussion/userCanComment')
const userWaitUntil = require('../Discussion/userWaitUntil')
const { contentLength } = require('../Comment')
const slack = require('../../../lib/slack')
const { timeahead } = require('@orbiting/backend-modules-formats')
const Promise = require('bluebird')

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

  const [canComment, waitUntil] = await Promise.all([
    userCanComment(discussion, null, context),
    userWaitUntil(discussion, null, { pgdb, user })
  ])
  if (!canComment) {
    throw new Error(t('api/comment/canNotComment'))
  }
  if (waitUntil) {
    throw new Error(t('api/comment/tooEarly', {
      timeahead: timeahead(t, (waitUntil.getTime() - new Date().getTime()) / 1000)
    }))
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

  // prebuild comment
  const unsavedComment = await transform.create(
    {
      id,
      discussionId: discussion.id,
      parentId,
      userId,
      content,
      tags,
      now: args.now
    },
    context
  )

  // ensure comment length is within limit
  if (
    discussion.maxLength &&
    unsavedComment.content.length > discussion.maxLength &&
    await contentLength(unsavedComment, {}, context) > discussion.maxLength
  ) {
    throw new Error(t('api/comment/tooLong', { maxLength: discussion.maxLength }))
  }

  let newComment
  const transaction = await pgdb.transactionBegin()
  try {
    if (discussionPreferences) {
      await setDiscussionPreferences({
        discussionPreferences,
        userId,
        discussion,
        transaction,
        t
      })
    }

    newComment = await transaction.public.comments.insertAndGet(
      unsavedComment
    )

    await transaction.transactionCommit()
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }

  if (newComment) {
    await Promise.all([
      notify(newComment, discussion, context),
      pubsub.publish('comment', {
        comment: {
          mutation: 'CREATED',
          node: newComment
        }
      }),
      slack.publishComment(newComment, discussion, context)
    ])
      .catch(e => {
        console.error(e)
      })
  }

  return newComment
}
