const debug = require('debug')('access:lib:constraints:recipientIsGranter')

/**
 * Constraint checks if recipient's email address is also granter's email
 * address. If false, constraint will fail.
 *
 * Story: A granter should be able to grant access to itself.
 *
 * @example: {"recipientIsGranter": {}}
 */

const isGrantable = async (args, context) => {
  const { email, granter } = args

  const isEqual =
    email.trim().toLowerCase() === granter.email.trim().toLowerCase()

  debug({
    granter: granter.id,
    email,
    isEqual
  })

  return isEqual
}

const getMeta = () => ({
  visible: true,
  grantable: null, // unknown if it is grantable
  payload: {}
})

module.exports = {
  isGrantable,
  getMeta
}
