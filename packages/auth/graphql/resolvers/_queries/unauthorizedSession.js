const { sessionByToken, NoSessionError } = require('../../../lib/Sessions')

module.exports = async (_, args, { pgdb, user: me, req }) => {
  const { email, token } = args
  const session = await sessionByToken({ pgdb, token, email })

  if (!session) {
    throw new NoSessionError({ email, token })
  }
  return {
    session,
    enabledSecondFactors: [...new Set(me.enabledSecondFactors)]
  }
}
