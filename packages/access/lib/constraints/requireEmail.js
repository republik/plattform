const debug = require('debug')('access:lib:constraints:requireEmail')

const validator = require('validator')

/**
 * Checks if an email address is provided and fails if email address is
 * missing or invalid.
 *
 * @example: {"requireEmail": {}}
 */

const isGrantable = async (args) => {
  const { granter, email } = args

  const isValid = !!email && !!validator.isEmail(email)

  debug('isGrantable', {
    granter: granter.id,
    email,
    isValid,
  })

  return isValid
}

const getMeta = async () => ({
  visible: true,
  grantable: null,
  payload: {},
})

module.exports = {
  isGrantable,
  getMeta,
}
