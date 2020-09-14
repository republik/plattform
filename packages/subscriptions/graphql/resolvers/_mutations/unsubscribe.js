const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const { unsubscribe } = require('../../../lib/Subscriptions')

module.exports = async (_, args, context) => {
  const {
    user: me,
    t,
    req,
    loaders: { Subscription },
  } = context
  const { subscriptionId, filters } = args
  ensureSignedIn(req, t)

  const subscription = await Subscription.byId.load(subscriptionId)
  if (!subscription) {
    throw new Error(t('api/subscriptions/404'))
  }
  if (subscription.userId !== me.id) {
    throw new Error(t('api/subscriptions/notAllowed'))
  }

  return unsubscribe(
    {
      id: subscriptionId,
      filters,
    },
    context,
  )
}
