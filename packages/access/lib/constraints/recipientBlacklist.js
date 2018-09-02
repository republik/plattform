const debug = require('debug')('access:lib:constraints:recipientBlacklist')

/**
 * Constraint checks if recipient's email address is to be found in
 * settings.emails[]. If found, constraint will fail.
 *
 * Story: An email address should be prevent to receive any access grants.
 *
 * @example: {"recipientBlacklist": {"emails": ["email@domain.tld", "a@b.c"]}}
 */

const isGrantable = async (args, context) => {
  const { email, settings } = args

  const valid = !settings.emails.includes(email.trim().toLowerCase())

  debug(
    'isGrantable',
    {
      email,
      settings,
      valid
    }
  )

  return valid
}

const getMeta = async (args, context) => ({
  visible: true,
  grantable: null,
  payload: {}
})

module.exports = {
  isGrantable,
  getMeta
}
