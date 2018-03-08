const { displayAuthor: getDisplayAuthor } = require('../graphql/resolvers/Comment')

const {
  DEFAULT_MAIL_FROM_ADDRESS,
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

    await Promise.all([
      pubsub.publish('webNotification', { webNotification: {
        title: t('api/comment/notification/new/web/subject', { discussionName: discussion.title }),
        body: `${displayAuthor.name}: ${shortBody}`,
        icon: t('api/comment/notification/new/web/icon'),
        userIds: notifyUsers
          .filter(u => u.discussionNotificationChannels.indexOf('WEB') > -1)
          .map(u => u.id)
      }}),
      ...notifyUsers
        .filter(u => u.discussionNotificationChannels.indexOf('EMAIL') > -1)
        .map(u => {
          return sendMailTemplate({
            to: u.email,
            fromEmail: DEFAULT_MAIL_FROM_ADDRESS,
            subject: t('api/comment/notification/new/email/subject', { discussionName: discussion.title }),
            templateName: 'cf_comment_notification_new',
            globalMergeVars: [
              { name: 'LINK',
                content: `${FRONTEND_BASE_URL}${discussion.documentPath}?focus=${comment.id}`
              },
              { name: 'DISCUSSION_TITLE',
                content: discussion.title
              },
              { name: 'CONTENT',
                content: comment.content
              },
              { name: 'NAME',
                content: displayAuthor.name
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
    ])
  }
}

module.exports = {
  submitComment
}
