const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const Promise = require('bluebird')

module.exports = async (_, args, context) => {
  const {
    pgdb,
    user: me,
    pubsub,
    req,
    loaders
  } = context

  ensureSignedIn(req)

  const notifications = await pgdb.public.notifications.find({
    readAt: null,
    userId: me.id
  })

  if (!notifications.length) {
    return notifications
  }

  const newNotifications = await pgdb.public.notifications.updateAndGet(
    { id: notifications.map(n => n.id) },
    {
      readAt: new Date()
    }
  )
  loaders.Notifications.byKeyObj.clearAll()

  await Promise.all(newNotifications.map(n =>
    pubsub.publish('notification', {
      notification: n
    })
  ))

  return newNotifications
}
