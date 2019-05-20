const debug = require('debug')('access:lib:constraints:recipientNotGranter')

/**
 * Constraint checks if recipient's email address is also granter's email
 * address. If true, constraint will fail.
 *
 * Story: A granter should not be able to grant access to itself.
 *
 * @example: {"recipientNotGranter": {}}
 */

const isGrantable = async (args, context) => {
  const { email, granter } = args

  const isNotEqual =
    email.trim().toLowerCase() !== granter.email.trim().toLowerCase()

  debug({
    granter: granter.id,
    email,
    isNotEqual
  })

  return isNotEqual
}

const getMeta = () => ({
  visible: true,
  grantable: null, // unkown if it is grantable
  payload: {}
})

module.exports = {
  isGrantable,
  getMeta
}
