const handlers = require('export-files')(__dirname)
const { withConfiguration } = require('../NewsletterSubscription')
const errors = require('../errors')

module.exports = {
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
