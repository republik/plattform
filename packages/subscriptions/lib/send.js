const Promise = require('bluebird')
const { getSubscriptionsForUserAndObject } = require('./Subscriptions')
const { sendMailTemplate } = require('@orbiting/backend-modules-mail')
const pushNotifications = require('@orbiting/backend-modules-push-notifications/lib/app')

const getChannelsForUser = (user, subscriptionInfo, subscription) => {
  if (subscriptionInfo.objectType === 'Discussion') {
    return user._raw.discussionNotificationChannels
  }
  return user._raw.discussionNotificationChannels
}

const send = async (args, context) => {
  const {
    users,
    content
  } = args
  const {
    pgdb,
    pubsub,
    t
  } = context
  if (!args.event || !users || !content || !content.app) {
    console.error('missing arg')
    throw new Error(t('api/unexpected'))
  }

  const event = await pgdb.public.events.insertAndGet({
    ...args.event
  })

  const notifications = await Promise.map(
    users,
    async (user) => {
      const subscription = user.__subscription ||
        await getSubscriptionsForUserAndObject(
          user.id,
          {
            type: args.subscription.objectType,
            id: args.subscription.objectId
          },
          context
        )
          .then(subs => {
            if (subs.length > 1) {
              throw new Error(t('api/unexpected'))
            }
            return subs
          })

      const notification = await pgdb.public.notifications.insertAndGet({
        eventId: event.id,
        userId: user.id,
        subscriptionId: subscription && subscription.id,
        channels: getChannelsForUser(
          user, args.subscription, subscription
        ),
        content: args.content.app
      })

      return {
        ...notification,
        user
      }
    }
  )

  const webUserIds = notifications
    .filter(n => n.channels.indexOf('WEB') > -1)
    .map(n => n.user.id)
  const appUserIds = notifications
    .filter(n => n.channels.indexOf('APP') > -1)
    .map(n => n.user.id)

  const emailNotifications = content.mail && notifications
    .filter(n => n.channels.indexOf('EMAIL') > -1)

  await Promise.all([
    webUserIds.length && (
      pubsub.publish('webNotification', {
        webNotification: content.app,
        userIds: webUserIds
      })
    ),
    appUserIds.length && (
      pushNotifications.publish(appUserIds, content.app, context)
    ),
    emailNotifications && emailNotifications.length && (
      Promise.all(emailNotifications.map(notification =>
        sendMailTemplate(content.mail(notification.user), context)
          .then(result => {
            if (result && result.mailLogId) {
              return pgdb.public.notifications.updateOne(
                { id: notification.id },
                { mailLogId: result.mailLogId }
              )
            }
          })
      ))
    ),
    Promise.all(notifications.map(n =>
      pubsub.publish('notification', {
        notification: n
      })
    ))
  ].filter(Boolean))
}

module.exports = send
