const kraut = require('kraut')
const geoForIP = require('./geoForIP')

const {
  NoSessionError,
  QueryEmailMismatchError,
  DestroySessionError,
  InitiateSessionError } = require('./errors')
const {
  validateChallenge
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

const initiateSession = async ({ req, pgdb, ipAddress, userAgent, email }) => {
  const phrase = `${kraut.adjectives.random()} ${kraut.verbs.random()} ${kraut.nouns.random()}`
  const { country, city } = geoForIP(ipAddress)
  req.session.email = email
  req.session.ip = ipAddress
  req.session.ua = userAgent
  if (country || city) {
    req.session.geo = { country, city }
  }
  await new Promise(function (resolve, reject) {
    req.session.save(function (error, data) {
      if (error) {
        return reject(new InitiateSessionError({ req, error }))
      }
      return resolve(data)
    })
  })
  const session = await pgdb.public.sessions.findOne({ sid: req.sessionID })
  if (!session) {
    throw new NoSessionError({ email })
  }
  return {
    session,
    country,
    city,
    phrase
  }
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
  const validatedSessionIds = []
  for (const tokenChallenge of tokens) {
    const sessionId = await validateChallenge({ pgdb, email: emailFromQuery, ...tokenChallenge })
    if (!sessionId) throw new Error('one of the challenges failed')
    validatedSessionIds.push(sessionId)
  }

  if ([...(new Set(validatedSessionIds))].length > 1) {
    throw new Error('you can only validate one session at a time')
  }

  const sessionId = validatedSessionIds[0]
  const session = await pgdb.public.sessions.findOne({ id: sessionId })
  if (!session) throw new NoSessionError({ sessionId })

  // verify and/or create the user
  const { user, isVerificationUpdated } = await upsertUserVerified({
    pgdb,
    email: session.sess.email
  })

  // log in the session and delete token
  await pgdb.public.sessions.updateOne({
    id: session.id
  }, {
    sess: {
      ...session.sess,
      passport: {
        user: user.id
      }
    }
  })

  await pgdb.public.tokens.update({
    sessionId
  }, {
    expiresAt: new Date()
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
  initiateSession,
  sessionByToken,
  findAllUserSessions,
  authorizeSession,
  clearUserSession,
  clearAllUserSessions,
  destroySession
}
