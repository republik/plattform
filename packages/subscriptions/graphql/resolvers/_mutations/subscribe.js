const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const { upsertSubscription } = require('../../../lib/Subscriptions')

module.exports = (_, args, context) => {
  const { user: me, t, req } = context
  ensureSignedIn(req, t)

  return upsertSubscription(
    { ...args, userId: me.id },
    context
  )
}
