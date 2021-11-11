const htmlToText = require('html-to-text')
const { renderEmail } = require('mdast-react-render/lib/email')

const { transformUser } = require('@orbiting/backend-modules-auth')
const {
  createCommentEmailSchema,
  inQuotes,
} = require('@orbiting/backend-modules-styleguide')
const {
  Subscriptions: {
    getSubscriptionsForUserAndObjects,
    getUsersWithSubscriptions,
  },
  sendNotification,
} = require('@orbiting/backend-modules-subscriptions')
const Promise = require('bluebird')

const {
  displayAuthor: originalGetDisplayAuthor,
  content: getContent,
  preview: getPreview,
} = require('../graphql/resolvers/Comment')

const {
  DEFAULT_MAIL_FROM_ADDRESS,
  DEFAULT_MAIL_FROM_NAME,
  FRONTEND_BASE_URL,
  GENERAL_FEEDBACK_DISCUSSION_ID,
} = process.env

const getDiscussionUrl = async (discussion, context) => {
  const communityUrl = `${FRONTEND_BASE_URL}/dialog?id=${discussion.id}`
  if (discussion.id === GENERAL_FEEDBACK_DISCUSSION_ID) {
    return `${communityUrl}&t=general`
  }
  const document =
    discussion.repoId &&
    (await context.loaders.Document.byRepoId.load(discussion.repoId))
  if (document && document.meta && document.meta.template === 'article') {
    return `${communityUrl}&t=article`
  }
  return `${FRONTEND_BASE_URL}${discussion.path}`
}

const getDisplayAuthor = (comment, context) => {
  return originalGetDisplayAuthor(comment, {}, context)
}

const getCommentInfo = async (comment, displayAuthor, discussion, context) => {
  const { t } = context

  const { preview, discussionUrl, contentMdast } = await Promise.props({
    preview: getPreview(comment, { length: 128 }, context),
    discussionUrl: getDiscussionUrl(discussion, context),
    contentMdast: getContent(comment, { strip: false }, context),
  })

  const contentHtml = renderEmail(
    contentMdast,
    createCommentEmailSchema(),
    { doctype: '' }
  )
  const contentPlain = htmlToText.fromString(contentHtml)

  const { parentIds } = comment

  return {
    discussionUrl,
    contentHtml,
    contentPlain,
    shortBody: preview.more ? `${preview.string}...` : preview.string,
    commentUrl: `${discussionUrl}${
      discussionUrl.indexOf('?') === -1 ? '?' : '&'
    }focus=${comment.id}`,
    muteUrl: `${discussionUrl}${
      discussionUrl.indexOf('?') === -1 ? '?' : '&'
    }mute=1`,
    subjectParams: {
      authorName: displayAuthor.name,
      discussionName: inQuotes(discussion.title),
    },
    isTopLevelComment: !parentIds || parentIds.length === 0,
    icon:
      displayAuthor.profilePicture ||
      t('api/comment/notification/new/app/icon'),
  }
}

const submitComment = async (comment, discussion, context, testUsers) => {
  const { pgdb, t } = context
  const { id, parentIds, discussionId, userId } = comment

  if (testUsers && !Array.isArray(testUsers)) {
    throw new Error(t('api/unexpected'))
  }

  const displayAuthor = await getDisplayAuthor(comment, context)

  const subscribers =
    testUsers ||
    (await pgdb
      .query(
        `
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
  `,
        {
          discussionId,
          parentIds,
          userId,
        },
      )
      .then((users) => users.map(transformUser)))

  const subscriptions = displayAuthor.anonymity
    ? []
    : await getSubscriptionsForUserAndObjects(
        null,
        {
          type: 'User',
          ids: [comment.userId],
          filter: 'Comment',
        },
        context,
      )

  const additionalSubscribers = testUsers
    ? []
    : await getUsersWithSubscriptions(subscriptions, context).then((arr) =>
        arr.filter(
          ({ id: id1 }) =>
            subscribers.findIndex(({ id: id2 }) => id1 === id2) === -1,
        ),
      )

  if (additionalSubscribers.length) {
    const discussionPreferences = await pgdb.public.discussionPreferences.find({
      userId: additionalSubscribers.map((s) => s.id),
      discussionId: comment.discussionId,
    })

    additionalSubscribers
      .filter((subscriber) => {
        const discussionPreference = discussionPreferences.find(
          ({ userId }) => userId === subscriber.id,
        )

        return (
          discussionPreference?.notificationOption !== 'NONE' ??
          subscriber._raw.defaultDiscussionNotificationOption !== 'NONE'
        )
      })
      .forEach((subscriber) => {
        subscribers.push(subscriber)
      })
  }

  if (subscribers.length > 0) {
    const {
      discussionUrl,
      contentHtml,
      contentPlain,
      shortBody,
      commentUrl,
      muteUrl,
      subjectParams,
      isTopLevelComment,
      icon,
    } = await getCommentInfo(comment, displayAuthor, discussion, context)

    await sendNotification(
      {
        subscription: {
          objectType: 'Discussion',
          objectId: discussion.id,
        },
        event: {
          objectType: 'Comment',
          objectId: id,
        },
        users: subscribers,
        content: {
          app: {
            title: isTopLevelComment
              ? t('api/comment/notification/new/app/subject', subjectParams)
              : t('api/comment/notification/answer/app/subject', subjectParams),
            body: `${displayAuthor.name}: ${shortBody}`,
            url: commentUrl,
            icon,
            type: 'discussion',
            tag: id,
          },
          mail: (u) => ({
            to: u.email,
            fromEmail: DEFAULT_MAIL_FROM_ADDRESS,
            fromName: DEFAULT_MAIL_FROM_NAME,
            subject: isTopLevelComment
              ? t('api/comment/notification/new/email/subject', subjectParams)
              : t(
                  'api/comment/notification/answer/email/subject',
                  subjectParams,
                ),
            templateName: 'cf_comment_notification_new',
            globalMergeVars: [
              {
                name: 'NAME',
                content: u.name,
              },
              {
                name: 'COMMENTER_NAME',
                content: displayAuthor.name,
              },
              {
                name: 'DISCUSSION_TITLE',
                content: discussion.title,
              },
              {
                name: 'DISCUSSION_URL',
                content: discussionUrl,
              },
              {
                name: 'DISCUSSION_MUTE_URL',
                content: muteUrl,
              },
              {
                name: 'CONTENT_HTML',
                content: contentHtml,
              },
              {
                name: 'CONTENT_PLAIN',
                content: contentPlain,
              },
              {
                name: 'URL',
                content: commentUrl,
              },
              ...(displayAuthor.credential
                ? [
                    {
                      name: 'CREDENTIAL_DESCRIPTION',
                      content: displayAuthor.credential.description,
                    },
                    {
                      name: 'CREDENTIAL_VERIFIED',
                      content: displayAuthor.credential.verified,
                    },
                  ]
                : []),
            ],
          }),
        },
      },
      context,
    )
  }
}

module.exports = {
  submitComment,
  getDiscussionUrl,
}
