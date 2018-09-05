const { unauthorizedSession } = require('../../../lib/Users')
const { missingConsents } = require('../../../lib/Consents')
const { getMissingFields } = require('../../../lib/Fields')

module.exports = async (_, args, { pgdb, req, user: me }) => {
  const { email, token } = args
  const session = await unauthorizedSession({ pgdb, token, email, me })

  const user = await pgdb.public.users.findOne({ email })

  const requiredConsents = await missingConsents({
    userId: user && user.id,
    pgdb,
    consents: session.sess.consents
  })

  const requiredFields = await getMissingFields({ user, email, pgdb })

  return {
    session,
    enabledSecondFactors: (user && user.enabledSecondFactors) || [],
    requiredConsents,
    requiredFields,
    newUser: !user || !user.verified
  }
}
