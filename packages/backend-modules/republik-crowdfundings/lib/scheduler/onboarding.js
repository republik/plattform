const debug = require('debug')('crowdfundings:lib:scheduler:onboarding')

const TYPE = 'onboarding'

const inform = async (args, context) => {
  // send right onboarding mail to right people
  debug('this exists')
}

module.exports = {
  TYPE,
  inform,
}
