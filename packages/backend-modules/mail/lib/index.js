const handlers = {
  deleteEmail: require('../../mailchimp/lib/deleteEmail'),
  getNewsletterSettings: require('../../mailchimp/lib/getNewsletterSettings'),
  mailLog: require('./mailLog'),
  changeEmailOnMailchimp: require('../../mailchimp/lib/changeEmailOnMailchimp'),
  sendMailTemplate: require('./sendMailTemplate'),
  updateMergeFields: require('../../mailchimp/lib/updateMergeFields'),
  updateNewsletterSubscriptions: require('../../mailchimp/lib/updateNewsletterSubscriptions'),

  // MailChimp batch operations types
  operations: {
    covidAccessToken: require('../../mailchimp/lib/operations/covidAccessTokens'),
    nameAndEmailBase64u: require('../../mailchimp/lib/operations/nameAndEmailBase64u'),
  },
}
const { withConfiguration } = require('../../mailchimp/NewsletterSubscription')
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
