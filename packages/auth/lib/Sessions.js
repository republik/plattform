const kraut = require('kraut')
const geoForIP = require('./geoForIP')
const AuthError = require('./AuthError')

const ERROR_QUERY_EMAIL_MISMATCH = 'query-email-mismatch'
const ERROR_NO_SESSION = 'no-session'
const ERROR_SESSION_DESTROY_FAILED = 'session-destroy-failed'
const ERROR_TIME_BASED_PASSWORD_MISMATCH = 'time-based-password-mismatch'
const ERROR_SESSION_INIT_FAILED = 'session-init-failed'
const ERROR_TOKEN_EXPIRED = 'token-expired'

class DestroySessionError extends AuthError {
  constructor (meta) {
    super(ERROR_SESSION_DESTROY_FAILED, meta)
  }
}

class InitiateSessionError extends AuthError {
  constructor (meta) {
    super(ERROR_SESSION_INIT_FAILED, meta)
  }
}

class QueryEmailMismatchError extends AuthError {
  constructor (meta) {
    super(ERROR_QUERY_EMAIL_MISMATCH, meta)
  }
}

class NoSessionError extends AuthError {
  constructor (meta) {
    super(ERROR_NO_SESSION, meta)
  }
}

class TimeBasedPasswordMismatchError extends AuthError {
  constructor (meta) {
    super(ERROR_TIME_BASED_PASSWORD_MISMATCH, meta)
  }
}

class TokenExpiredError extends AuthError {
  constructor (meta) {
    super(ERROR_TOKEN_EXPIRED, meta)
  }
}

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
        return reject(new InitiateSessionError({ headers: req.headers, error }))
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
      t.type = :type
    `, token)

  if (!sessions || sessions.length !== 1) {
    if (sessions.length > 1) console.error('wtf why?', sessions)
    throw new NoSessionError({ token, emailFromQuery, ...meta })
  }
  const session = sessions[0]
  const { tokenExpiresAt, id } = session
  if (tokenExpiresAt.getTime() < (new Date()).getTime() || !id) {
    throw new TokenExpiredError({ token, tokenExpiresAt, sessionId: session.id })
  }
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
  QueryEmailMismatchError,
  NoSessionError,
  DestroySessionError,
  InitiateSessionError,
  TimeBasedPasswordMismatchError,
  TokenExpiredError
}
