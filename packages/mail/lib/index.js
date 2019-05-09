const handlers = {
  deleteEmail: require('./deleteEmail'),
  getNewsletterSettings: require('./getNewsletterSettings'),
  mailLog: require('./mailLog'),
  moveNewsletterSubscriptions: require('./moveNewsletterSubscriptions'),
  sendMail: require('./sendMail'),
  sendMailTemplate: require('./sendMailTemplate'),
  unsubscribeEmail: require('./unsubscribeEmail'),
  updateNewsletterSubscription: require('./updateNewsletterSubscription'),
  updateNewsletterSubscriptions: require('./updateNewsletterSubscriptions')
}
const { withConfiguration } = require('../NewsletterSubscription')
const errors = require('../errors')

module.exports = {
  ...handlers,
  createMail: (interestConfiguration) => {
    if (!interestConfiguration) throw new errors.SubscriptionConfigurationMissingMailError()
    return Object
      .keys(handlers)
      .reduce((result, handlerName) => {
        return {
          ...result,
          [handlerName]: withConfiguration(interestConfiguration, handlers[handlerName])
        }
      }, { ...errors })
  }
}
