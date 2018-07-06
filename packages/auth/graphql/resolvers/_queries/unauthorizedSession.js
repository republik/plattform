const { unauthorizedSession } = require('../../../lib/Users')
const { missingConsents } = require('../../../lib/Consents')

module.exports = async (_, args, { pgdb, req, user: me }) => {
  const { email, token } = args
  const session = await unauthorizedSession({ pgdb, token, email, me })

  const user = await pgdb.public.users.findOne({
    email
  })

  const requiredConsents = await missingConsents({
    userId: user && user.id,
    pgdb,
    consents: session.sess.consents
  })

  return {
    session,
    enabledSecondFactors: (user && user.enabledSecondFactors) || [],
    requiredConsents,
    newUser: !user || !user.verified
  }
}
