const {
  deleteEmail,
  getNewsletterSettings,
  changeEmailOnMailchimp,
  updateNameMergeFields,
  updateNewsletterSubscriptions,
  covidAccessToken,
  nameAndEmailBase64u,
  createNewsletterSubscription,
} = require('@orbiting/backend-modules-mailchimp')

const handlers = {
  deleteEmail: deleteEmail,
  getNewsletterSettings: getNewsletterSettings,
  mailLog: require('./mailLog'),
  changeEmailOnMailchimp: changeEmailOnMailchimp,
  sendMailTemplate: require('./sendMailTemplate'),
  updateNameMergeFields: updateNameMergeFields,
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
  createMail: (newsletterConfigs) => {
    if (!newsletterConfigs)
      throw new errors.SubscriptionConfigurationMissingMailError()

    const NewsletterSubscription =
      createNewsletterSubscription(newsletterConfigs)

    const mail = { ...errors }

    for (const [key, handler] of Object.entries(handlers)) {
      mail[key] = (data) => handler(data, NewsletterSubscription)
    }

    return mail
  },
}
