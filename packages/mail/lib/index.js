const handlers = require('export-files')(__dirname)
const { withConfiguration } = require('../NewsletterSubscription')
const Errors = require('../errors')

module.exports = {
  createMail: (interestConfiguration) => {
    if (!interestConfiguration) throw new Errors.SubscriptionConfigurationMissingMailError()
    return Object
      .keys(handlers)
      .reduce((result, handlerName) => {
        return {
          ...result,
          [handlerName]: withConfiguration(interestConfiguration, handlers[handlerName])
        }
      }, { ...Errors })
  }
}
