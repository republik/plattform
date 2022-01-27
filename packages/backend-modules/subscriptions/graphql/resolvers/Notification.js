const { getObjectByIdAndType } = require('../../lib/genericObject')

module.exports = {
  object({ eventObjectType, eventObjectId }, args, context) {
    return getObjectByIdAndType(
      {
        id: eventObjectId,
        type: eventObjectType,
      },
      context,
    )
  },
  subscription({ subscriptionId }, args, { loaders }) {
    if (!subscriptionId) {
      return null
    }
    return loaders.Subscription.byId.load(subscriptionId)
  },
}
