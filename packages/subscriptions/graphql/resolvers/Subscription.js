const { getObject, getSubject } = require('../../lib/Subscriptions')

module.exports = {
  subject (subscription, args, context) {
    return getSubject(subscription, context)
  },
  object (subscription, args, context) {
    return getObject(subscription, context)
  }
}
