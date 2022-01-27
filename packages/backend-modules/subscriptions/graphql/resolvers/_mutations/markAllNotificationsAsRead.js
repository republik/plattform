const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const Promise = require('bluebird')

module.exports = async (_, args, context) => {
  const { pgdb, user: me, pubsub, req, loaders } = context

  ensureSignedIn(req)

  const notifications = await pgdb.public.notifications.find({
    readAt: null,
    userId: me.id,
  })

  if (!notifications.length) {
    return notifications
  }

  const updatedNotifications = await pgdb.public.notifications.updateAndGet(
    { id: notifications.map((n) => n.id) },
    {
      readAt: new Date(),
    },
  )
  loaders.Notification.byKeyObj().clearAll()

  await Promise.all(
    updatedNotifications.map((n) =>
      pubsub.publish('notification', {
        notification: n,
      }),
    ),
  )

  return updatedNotifications
}
