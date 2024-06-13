const handlers = {
  deleteEmail: require('./deleteEmail'),
  getNewsletterSettings: require('./getNewsletterSettings'),
  mailLog: require('./mailLog'),
  changeEmailOnMailchimp: require('./changeEmailOnMailchimp'),
  sendMailTemplate: require('./sendMailTemplate'),
  updateMergeFields: require('./updateMergeFields'),
  updateNewsletterSubscriptions: require('./updateNewsletterSubscriptions'),

  // MailChimp batch operations types
  operations: {
    covidAccessToken: require('./operations/covidAccessTokens'),
    nameAndEmailBase64u: require('./operations/nameAndEmailBase64u'),
  },
}
const { withConfiguration } = require('../NewsletterSubscription')
const errors = require('../errors')

module.exports = {
  ...handlers,
  createMail: (interestConfiguration) => {
    if (!interestConfiguration)
      throw new errors.SubscriptionConfigurationMissingMailError()
    return Object.keys(handlers).reduce(
      (result, handlerName) => {
        return {
          ...result,
          [handlerName]: withConfiguration(
            interestConfiguration,
            handlers[handlerName],
          ),
        }
      },
      { ...errors },
    )
  },
}
