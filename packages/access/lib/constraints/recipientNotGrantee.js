const debug = require('debug')('access:lib:constraints:recipientNotGrantee')

/**
 * Constraint checks if recipient's email address is also grantee's email
 * address. If true, constraint will fail.
 *
 * Story: A grantee should not be able to grant access to itself.
 *
 * @example: {"recipientNotGrantee": {}}
 */

const isGrantable = async (args, context) => {
  const { email, grantee } = args

  const isNotEqual =
    email.trim().toLowerCase() !== grantee.email.trim().toLowerCase()

  debug({
    grantee: grantee.id,
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
