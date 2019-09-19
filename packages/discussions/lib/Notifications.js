const {
  displayAuthor: getDisplayAuthor,
  content: getContent,
  preview: getPreview
} = require('../graphql/resolvers/Comment')
const { transformUser } = require('@orbiting/backend-modules-auth')

const commentSchema = require('@project-r/styleguide/lib/templates/Comment/email').default()
const { renderEmail } = require('mdast-react-render/lib/email')
const appNotifications = require('@orbiting/backend-modules-notifications/lib/app')

const { sendMailTemplate } = require('@orbiting/backend-modules-mail')

const { Subscriptions } = require('@orbiting/backend-modules-subscriptions')
const uniqWith = require('lodash/uniqWith')

const {
  DEFAULT_MAIL_FROM_ADDRESS,
  DEFAULT_MAIL_FROM_NAME,
  FRONTEND_BASE_URL,
  GENERAL_FEEDBACK_DISCUSSION_ID
} = process.env

const getDiscussionUrl = async (discussion, context) => {
  const communityUrl = `${FRONTEND_BASE_URL}/dialog?id=${discussion.id}`
  if (discussion.id === GENERAL_FEEDBACK_DISCUSSION_ID) {
    return `${communityUrl}&t=general`
  }
  const document = discussion.repoId && await context.loaders.Document.byRepoId.load(discussion.repoId)
  if (document && document.meta && document.meta.template === 'article') {
    return `${communityUrl}&t=article`
  }
  return `${FRONTEND_BASE_URL}${discussion.path}`
}

const submitComment = async (comment, discussion, context) => {
  const {
    pgdb,
    pubsub,
    t
  } = context

  const displayAuthor = await getDisplayAuthor(
    comment,
    {
      portrait: {
        webp: false
      }
    },
    context
  )

  const discussionNotificationUsers = await pgdb.query(`
      -- commenters in discussion
      SELECT
        u.*
      FROM
        users u
      JOIN
        comments c
        ON
          c."userId" = u.id AND
          c."discussionId" = :discussionId
      LEFT JOIN
        "discussionPreferences" dp
        ON
          dp."userId" = u.id AND
          dp."discussionId" = :discussionId
      WHERE
        -- exclude commenter
        u.id != :userId AND
        (
          dp."notificationOption" = 'ALL' OR
          (dp."notificationOption" IS NULL AND u."defaultDiscussionNotificationOption" = 'ALL') OR
          (
            ARRAY[c.id] && :parentIds AND
            (
              dp."notificationOption" = 'MY_CHILDREN' OR
              (dp."notificationOption" IS NULL AND u."defaultDiscussionNotificationOption" = 'MY_CHILDREN')
            )
          )
        )
    UNION
      -- users that didn't comment but have discussionPreferences
      SELECT
        u.*
      FROM
        users u
      JOIN
        "discussionPreferences" dp
        ON
          dp."userId" = u.id AND
          dp."discussionId" = :discussionId AND
          dp."notificationOption" = 'ALL'
      WHERE
        -- exclude commenter
        u.id != :userId
  `, {
    discussionId: comment.discussionId,
    parentIds: comment.parentIds,
    userId: comment.userId
  })
    .then(users => users.map(transformUser))

  let discussionNotificationSubscribers = []

  const commenterSubscribers = displayAuthor.anonymity
    ? []
    : await Subscriptions.getSubscribersForObject(
      'User',
      comment.userId,
      'COMMENTS',
      context
    )

  if (commenterSubscribers.length > 0) {
    const subscriberDiscussionPreferences =
      await pgdb.public.discussionPreferences.find({
        userId: commenterSubscribers.map(s => s.id),
        discussionId: comment.discussionId
      })

    discussionNotificationSubscribers =
      commenterSubscribers.filter(subscriber => {
        const subscriberDiscussionPreference =
          subscriberDiscussionPreferences.find(({ userId }) => userId === subscriber.id)

        const notificationOption =
          subscriberDiscussionPreference &&
          subscriberDiscussionPreference.notificationOption !== 'NONE'

        if ([true, false].includes(notificationOption)) {
          return notificationOption
        }

        return subscriber._raw.defaultDiscussionNotificationOption !== 'NONE'
      })
  }

  const notifyUsers = uniqWith(
    [
      ...discussionNotificationUsers,
      ...discussionNotificationSubscribers
    ].filter(Boolean),
    (a, b) => a.id === b.id
  )

  if (notifyUsers.length > 0) {
    const contentMdast = await getContent(comment, null, context)
    const htmlContent = renderEmail(contentMdast, commentSchema, { doctype: '' })

    const preview = await getPreview(comment, { length: 128 }, context)
    const shortBody = preview.more
      ? `${preview.string}...`
      : preview.string

    const discussionUrl = await getDiscussionUrl(discussion, context)
    const commentUrl = `${discussionUrl}${discussionUrl.indexOf('?') === -1 ? '?' : '&'}focus=${comment.id}`
    const muteUrl = `${discussionUrl}${discussionUrl.indexOf('?') === -1 ? '?' : '&'}mute=1`

    const subjectParams = {
      authorName: displayAuthor.name,
      discussionName: discussion.title
    }
    const isTopLevelComment = !comment.parentIds || comment.parentIds.length === 0
    const icon = displayAuthor.profilePicture || t('api/comment/notification/new/web/icon')

    // notify WEB
    const webUserIds = notifyUsers
      .filter(u => u._raw.discussionNotificationChannels.indexOf('WEB') > -1)
      .map(u => u.id)

    if (webUserIds.length > 0) {
      await pubsub.publish('webNotification', { webNotification: {
        title: isTopLevelComment
          ? t('api/comment/notification/new/web/subject', subjectParams)
          : t('api/comment/notification/answer/web/subject', subjectParams),
        body: `${displayAuthor.name}: ${shortBody}`,
        icon,
        url: commentUrl,
        userIds: webUserIds,
        tag: comment.id
      } })
    }

    // notify APP
    const appUserIds = notifyUsers
      .filter(u => u._raw.discussionNotificationChannels.indexOf('APP') > -1)
      .map(u => u.id)

    if (appUserIds.length > 0) {
      await appNotifications.publish(appUserIds, {
        title: isTopLevelComment
          ? t('api/comment/notification/new/app/subject', subjectParams)
          : t('api/comment/notification/answer/app/subject', subjectParams),
        body: `${displayAuthor.name}: ${shortBody}`,
        url: commentUrl,
        icon,
        type: 'discussion'
      }, {
        pgdb
      })
    }

    // notify EMAIL
    await Promise.all(notifyUsers
      .filter(u => u._raw.discussionNotificationChannels.indexOf('EMAIL') > -1)
      .map(u => {
        return sendMailTemplate({
          to: u.email,
          fromEmail: DEFAULT_MAIL_FROM_ADDRESS,
          fromName: DEFAULT_MAIL_FROM_NAME,
          subject: isTopLevelComment
            ? t('api/comment/notification/new/email/subject', subjectParams)
            : t('api/comment/notification/answer/email/subject', subjectParams),
          templateName: 'cf_comment_notification_new',
          globalMergeVars: [
            { name: 'NAME',
              content: u.name
            },
            { name: 'COMMENTER_NAME',
              content: displayAuthor.name
            },
            { name: 'DISCUSSION_TITLE',
              content: discussion.title
            },
            { name: 'DISCUSSION_URL',
              content: discussionUrl
            },
            { name: 'DISCUSSION_MUTE_URL',
              content: muteUrl
            },
            { name: 'CONTENT',
              content: htmlContent
            },
            { name: 'URL',
              content: commentUrl
            },
            ...displayAuthor.credential
              ? [
                { name: 'CREDENTIAL_DESCRIPTION',
                  content: displayAuthor.credential.description
                },
                { name: 'CREDENTIAL_VERIFIED',
                  content: displayAuthor.credential.verified
                }
              ]
              : []
          ]
        }, context)
      })
    )
  }
}

module.exports = {
  submitComment,
  getDiscussionUrl
}
