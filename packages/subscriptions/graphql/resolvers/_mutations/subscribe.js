const { upsertSubscription } = require('../../../lib/Subscriptions')

module.exports = async (_, args, context) => {
  const { user: me } = context

  return upsertSubscription(
    { ...args, userId: me.id },
    context
  )
}
