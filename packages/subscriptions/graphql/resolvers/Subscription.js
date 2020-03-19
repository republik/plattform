const {
  getObject,
  getSubject,
  subscriptionIsEligibleForNotifications
} = require('../../lib/Subscriptions')

module.exports = {
  subject (subscription, args, context) {
    return getSubject(subscription, context)
  },
  object (subscription, args, context) {
    return getObject(subscription, context)
  },
  isEligibleForNotifications (subscription, args, context) {
    return subscriptionIsEligibleForNotifications(
      subscription,
      context
    )
  }
}
