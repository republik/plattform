const { ensureSignedIn } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, context) => {
  const {
    id
  } = args
  const {
    pgdb,
    user: me,
    t,
    pubsub,
    req
  } = context

  ensureSignedIn(req)

  const notification = await pgdb.public.notifications.findOne({ id })
  if (!notification) {
    throw new Error(t('api/notification/404'))
  }
  if (notification.userId !== me.id) {
    throw new Error(t('api/notification/notYours'))
  }

  if (notification.readAt) {
    return notification
  }

  const newNotification = await pgdb.public.notifications.updateAndGetOne(
    { id },
    { readAt: new Date() }
  )

  await pubsub.publish('notification', {
    notification: newNotification
  })

  return newNotification
}
