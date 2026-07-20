const { getObjectByIdAndType } = require('../../../lib/genericObject')
const {
  getSubscriptionsForUserAndObject,
  getSimulatedSubscriptionForUserAndObject,
} = require('../../../lib/Subscriptions')

// Root-level equivalent of Document.subscribedByMe/User.subscribedByMe, for
// object types (e.g. a Sanity-backed articleCollection) that don't resolve
// to a GraphQL Document/User type to hang a type-field off of.
module.exports = async (_, { objectId, type }, context) => {
  const { user: me, t } = context
  if (!me) {
    return null
  }

  const object = await getObjectByIdAndType({ id: objectId, type }, context)
  if (!object) {
    throw new Error(t('api/subscription/object/404', { id: objectId }))
  }
  const resolvedId = object.objectId || objectId

  const subs = await getSubscriptionsForUserAndObject(
    me.id,
    { type, id: resolvedId },
    context,
    { includeNotActive: true },
  )
  if (subs.length) {
    return subs[0]
  }

  return getSimulatedSubscriptionForUserAndObject(
    me.id,
    { type, id: resolvedId },
    context,
  )
}
