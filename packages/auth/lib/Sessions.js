const kraut = require('kraut')
const geoForIP = require('./geoForIP')
const { newAuthError } = require('./AuthError')

const DestroySessionError = newAuthError('session-destroy-failed', 'api/auth/errorDestroyingSession')
const InitiateSessionError = newAuthError('session-init-failed', 'api/auth/session-init-failed')
const NoSessionError = newAuthError('no-session', 'api/token/invalid')

const destroySession = async (req) => {
  return new Promise((resolve, reject) => {
    req.session.destroy(error => {
      if (error) {
        return reject(new DestroySessionError({ headers: req.headers, error }))
      }
      return resolve()
    })
  })
}

const initiateSession = async ({ req, pgdb, email, consents }) => {
  const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  const userAgent = req.headers['user-agent']
  const phrase = `${kraut.adjectives.random()} ${kraut.verbs.random()} ${kraut.nouns.random()}`
  const { country, city } = geoForIP(ipAddress)
  req.session.email = email
  req.session.ip = ipAddress
  req.session.ua = userAgent
  req.session.phrase = phrase
  if (country || city) {
    req.session.geo = { country, city }
  }
  if (consents) {
    req.session.consents = consents
  }
  await new Promise(function (resolve, reject) {
    req.session.save(function (error, data) {
      if (error) {
        return reject(new InitiateSessionError({ headers: req.headers, error }))
      }
      return resolve(data)
    })
  })

  if (!req.sessionID) throw new NoSessionError({ email })
  const session = await pgdb.public.sessions.findOne({ sid: req.sessionID })
  if (!session) throw new NoSessionError({ email })
  return {
    session,
    country,
    city,
    phrase
  }
}

const sessionByToken = async ({ pgdb, token, email: emailFromQuery, ...meta }) => {
  const sessions = await pgdb.query(`
    SELECT DISTINCT
      s.*,
      t."expiresAt" as "tokenExpiresAt"
    FROM
      sessions s
    RIGHT OUTER JOIN
      tokens t
      ON t."sessionId" = s.id
    WHERE
      t.payload = :payload AND
      t.type = :type AND
      t."expiresAt" >= now()
    `, token)

  if (sessions && sessions.length > 0) {
    if (sessions[0].sess.email !== emailFromQuery) {
      throw new NoSessionError({ emailFromQuery, email: sessions[0].sess.email })
    }
    return sessions[0]
  }
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
    const email = await transaction.public.users.findOneFieldOnly({ id: userId }, 'email')
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

module.exports = {
  initiateSession,
  sessionByToken,
  findAllUserSessions,
  clearUserSession,
  clearAllUserSessions,
  destroySession,
  NoSessionError,
  DestroySessionError,
  InitiateSessionError
}
