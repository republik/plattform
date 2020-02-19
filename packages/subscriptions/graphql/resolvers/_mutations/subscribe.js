const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const { upsertSubscription } = require('../../../lib/Subscriptions')

module.exports = (_, args, context) => {
  const { user: me, req } = context
  ensureSignedIn(req)

  return upsertSubscription(
    { ...args, userId: me.id },
    context
  )
}
