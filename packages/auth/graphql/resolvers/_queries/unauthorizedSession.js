const { sessionByToken, NoSessionError } = require('../../../lib/Sessions')
const { missingConsents } = require('../../../lib/Consents')

module.exports = async (_, args, { pgdb, req }) => {
  const { email, token } = args
  const session = await sessionByToken({ pgdb, token, email })

  if (!session) {
    throw new NoSessionError({ email, token })
  }

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
