/** @typedef {import('@orbiting/backend-modules-types').GraphqlContext} GraphqlContext */

const { resolveUserByReferralCode } = require('../../../lib/referralCode')

/**
 * Find resolve campaign by slug
 * @param {object} _
 * @param {{ code: string }} args
 * @param {GraphqlContext} ctx
 * @returns {Promise<"OK" | "NOT_FOUND" | "IS_OWN">}
 */
module.exports = async (_, { code }, { user: me, pgdb }) => {
  const user = await resolveUserByReferralCode(code, pgdb)
  if (!user) {
    return 'NOT_FOUND'
  }

  if (me && me.id === user.id) {
    return 'IS_OWN'
  }

  return 'OK'
}
