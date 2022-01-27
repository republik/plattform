const { ensureUser } = require('@orbiting/backend-modules-auth')
const pushNotifications = require('@orbiting/backend-modules-push-notifications/lib/app')

const { FRONTEND_BASE_URL } = process.env

module.exports = async (_, args, context) => {
  const { user: me } = context

  ensureUser(me)

  await pushNotifications.publish(
    [me.id],
    {
      title: 'Test Benachrichtigung',
      body: 'Dies ist eine Test Benachrichtigung.',
      url: FRONTEND_BASE_URL,
      type: 'discussion',
      tag: 'test',
      ...args,
    },
    context,
  )

  return true
}
