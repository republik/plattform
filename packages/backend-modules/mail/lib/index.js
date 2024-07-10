const {
  deleteEmail,
  getNewsletterSettings,
  changeEmailOnMailchimp,
  updateMergeFields,
  updateNewsletterSubscriptions,
  covidAccessToken,
  nameAndEmailBase64u,
  withConfiguration,
} = require('@orbiting/backend-modules-mailchimp')

const handlers = {
  deleteEmail: deleteEmail,
  getNewsletterSettings: getNewsletterSettings,
  mailLog: require('./mailLog'),
  changeEmailOnMailchimp: changeEmailOnMailchimp,
  sendMailTemplate: require('./sendMailTemplate'),
  updateMergeFields: updateMergeFields,
  updateNewsletterSubscriptions: updateNewsletterSubscriptions,

  // MailChimp batch operations types
  operations: {
    covidAccessToken: covidAccessToken,
    nameAndEmailBase64u: nameAndEmailBase64u,
  },
}
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
