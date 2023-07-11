const debug = require('debug')('crowdfundings:lib:scheduler:onboarding')

const TYPE = 'onboarding'

const inform = async (args, context) => {
  // get all unsubscribed from mailchimp and set to archived?
  debug('onboarding scheduler')
}

module.exports = {
  TYPE,
  inform,
}
