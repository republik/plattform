const handlers = {
  deleteEmail: require('./deleteEmail'),
  getNewsletterSettings: require('./getNewsletterSettings'),
  mailLog: require('./mailLog'),
  moveNewsletterSubscriptions: require('./moveNewsletterSubscriptions'),
  sendMail: require('./sendMail'),
  sendMailTemplate: require('./sendMailTemplate'),
  unsubscribeEmail: require('./unsubscribeEmail'),
  updateMergeFields: require('./updateMergeFields'),
  updateNewsletterSubscription: require('./updateNewsletterSubscription'),
  updateNewsletterSubscriptions: require('./updateNewsletterSubscriptions'),

  // MailChimp batch operations types
  operations: {
    covidAccessToken: require('./operations/covidAccessTokens'),
    nameAndEmailBase64u: require('./operations/nameAndEmailBase64u')
  }
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
