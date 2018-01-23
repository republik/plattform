const {
  NoSessionError,
  QueryEmailMismatchError,
  DestroySessionError,
  TimeBasedPasswordMismatchError } = require('./errors')
const {
  validateTimeBasedPassword,
  findToken,
  TokenTypes
} = require('./Tokens')

const destroySession = async (req) => {
  return new Promise((resolve, reject) => {
    req.session.destroy(error => {
      if (error) {
        return reject(new DestroySessionError({ req, error }))
      }
      return resolve()
    })
  })
}

const sessionByToken = async ({ pgdb, token, email: emailFromQuery, ...meta }) => {
  if (!token || !token.payload) throw new NoSessionError({ emailFromQuery, ...meta })

  const session = await pgdb.public.sessions.findOne({
    'sess @>': { token }
  })

  if (!session) throw new NoSessionError({ token, emailFromQuery, ...meta })

  const { email } = session.sess
  if (emailFromQuery && email !== emailFromQuery) { // emailFromQuery might be null for old links
    throw new QueryEmailMismatchError({ token, email, emailFromQuery })
  }

  return session
}

const findAllUserSessions = async ({ pgdb, userId }) => {
  const sessions = await pgdb.public.sessions.find({
    'sess @>': { passport: { user: userId } }
  })
  return sessions || []
}

const clearAllUserSessions = async ({ pgdb, userId }) => {
  const transaction = await pgdb.transactionBegin()
  try {
    const sessions = await findAllUserSessions({ pgdb: transaction, userId })
    await Promise.all(sessions.map(session =>
      transaction.public.sessions.delete({ id: session.id })
    ))
    await transaction.transactionCommit()
    return (sessions.length > 0)
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}

const clearUserSession = async ({ pgdb, userId, sessionId }) => {
  const transaction = await pgdb.transactionBegin()
  try {
    const email = await transaction.public.users.findOne({ id: userId }, 'email')
    const sessions = await findAllUserSessions({ pgdb: transaction, userId })
    const matchingSessions = sessions
      .filter((session) => (session.id === sessionId))
    const session = matchingSessions && matchingSessions[0]
    if (!session) {
      throw new NoSessionError({ userId, sessionId, email })
    }
    await transaction.public.sessions.deleteOne({ id: session.id })
    await transaction.transactionCommit()
    return true
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}

const upsertUserVerified = async({ pgdb, email }) => {
  const existingUser = await pgdb.public.users.findOne({ email })
  const user = existingUser ||
    await pgdb.public.users.insertAndGet({
      email,
      verified: true
    })
  if (!user.verified) {
    await pgdb.public.users.updateOne({
      id: user.id
    }, {
      verified: true
    })
  }
  return {
    user,
    isVerificationUpdated: (!existingUser || !existingUser.verified)
  }
}

const authorizeSession = async ({ pgdb, tokens, emailFromQuery, signInHooks = [] }) => {
  // try to get the initiating session by email_token
  const emailToken = findToken(tokens, TokenTypes.EMAIL_TOKEN)
  const session = await sessionByToken({
    pgdb,
    token: emailToken,
    email: emailFromQuery
  })

  if (!session) {
    throw new NoSessionError({ tokens, email: emailFromQuery })
  }

  // verify and/or create the user
  const { user, isVerificationUpdated } = await upsertUserVerified({
    pgdb,
    email: session.sess.email
  })

  // check if user needs a second factor, if true, check for all tokens
  // TODO: sharedSecret and isTwoFactorEnforced must be stored on the user table
  user.isTwoFactorEnforced = true
  user.sharedSecret = 'AAAA'
  if (user.isTwoFactorEnforced) {
    const token = findToken(tokens, TokenTypes.TOTP)
    const isValid = await validateTimeBasedPassword({
      totp: token.payload,
      sharedSecret: user.sharedSecret
    })
    if (!isValid) {
      throw new TimeBasedPasswordMismatchError({ token, email: emailFromQuery })
    }
  }

  // log in the session and delete token
  await pgdb.public.sessions.updateOne({
    id: session.id
  }, {
    sess: {
      ...session.sess,
      token: null,
      passport: {
        user: user.id
      }
    }
  })

  // call signIn hooks
  try {
    await Promise.all(
      signInHooks.map(hook =>
        hook(
          user.id,
          isVerificationUpdated,
          pgdb
        )
      )
    )
  } catch (e) {
    console.warn(`sign in hook failed in authorizeSession`, e)
  }

  return user
}

module.exports = {
  sessionByToken,
  findAllUserSessions,
  authorizeSession,
  clearUserSession,
  clearAllUserSessions,
  destroySession
}
