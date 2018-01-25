const signIn = require('../../../lib/signIn')
const t = require('../../../lib/t')
const {
  // SessionInitializationFailedError,
  EmailInvalidError
} = require('../../../lib/errors')

module.exports = async (_, args, { pgdb, req }) => {
  const {
    email,
    context
  } = args

  try {
    return signIn(email, context, pgdb, req)
  } catch (error) {
    if (error instanceof EmailInvalidError) {
      throw new Error(t('api/email/invalid'))
    }
    console.error('auth: error saving session', { req: req._log(), error })
    throw new Error(t('api/auth/errorSavingSession'))
  }
}
