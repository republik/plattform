const { displayAuthor: getDisplayAuthor } = require('../graphql/resolvers/Comment')
const { transformUser } = require('@orbiting/backend-modules-auth')

const {
  DEFAULT_MAIL_FROM_ADDRESS,
  DEFAULT_MAIL_FROM_NAME,
  FRONTEND_BASE_URL
} = process.env

const submitComment = async (comment, discussion, context) => {
  const {
    pgdb,
    pubsub,
    t,
    mail: {
      sendMailTemplate
    }
  } = context

  const notifyUsers = await pgdb.query(`
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

  if (notifyUsers.length > 0) {
    const displayAuthor = await getDisplayAuthor(comment, null, context)

    const shortBody = comment.content.length > 128
      ? `${comment.content.substring(0, 128)}...`
      : comment.content

    const discussionUrl = `${FRONTEND_BASE_URL}${discussion.documentPath}`
    const commentUrl = `${discussionUrl}?focus=${comment.id}`

    const subjectParams = {
      authorName: displayAuthor.name,
      discussionName: discussion.title
    }
    const isTopLevelComment = !comment.parentIds || comment.parentIds.length === 0

    const webUserIds = notifyUsers
      .filter(u => u.discussionNotificationChannels.indexOf('WEB') > -1)
      .map(u => u.id)

    if (webUserIds.length > 0) {
      await pubsub.publish('webNotification', { webNotification: {
        title: isTopLevelComment
          ? t('api/comment/notification/new/web/subject', subjectParams)
          : t('api/comment/notification/answer/web/subject', subjectParams),
        body: `${displayAuthor.name}: ${shortBody}`,
        icon: displayAuthor.profilePicture || t('api/comment/notification/new/web/icon'),
        url: commentUrl,
        userIds: webUserIds,
        tag: comment.id
      }})
    }

    await Promise.all(notifyUsers
      .filter(u => u.discussionNotificationChannels.indexOf('EMAIL') > -1)
      .map(u => {
        const user = transformUser(u)
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
              content: user.name
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
              content: `${discussionUrl}?mute=1`
            },
            { name: 'CONTENT',
              content: comment.content
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
        })
      })
    )
  }
}

module.exports = {
  submitComment
}
