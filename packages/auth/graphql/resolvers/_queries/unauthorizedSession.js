const { sessionByToken, NoSessionError } = require('../../../lib/Sessions')
const { requiredConsents: getRequiredConsents } = require('../../../lib/Users')

module.exports = async (_, args, { pgdb, req }) => {
  const { email, token } = args
  const session = await sessionByToken({ pgdb, token, email })

  if (!session) {
    throw new NoSessionError({ email, token })
  }

  const user = await pgdb.public.users.findOne({
    email
  })

  const requiredConsents = await getRequiredConsents({
    pgdb,
    userId: user && user.id
  })

  return {
    session,
    enabledSecondFactors: (user && user.enabledSecondFactors) || [],
    requiredConsents,
    newUser: !user
  }
}
