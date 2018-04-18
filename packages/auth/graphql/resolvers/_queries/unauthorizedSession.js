const { sessionByToken, NoSessionError } = require('../../../lib/Sessions')

module.exports = async (_, args, { pgdb, req }) => {
  const { email, token } = args
  const session = await sessionByToken({ pgdb, token, email })

  if (!session) {
    throw new NoSessionError({ email, token })
  }
  const user = await pgdb.public.users.findOne({
    email
  })

  return {
    session,
    enabledSecondFactors: (user && user.enabledSecondFactors) || []
  }
}
