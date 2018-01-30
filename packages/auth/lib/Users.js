const isEmail = require('email-validator').validate
const isUUID = require('is-uuid')
const debug = require('debug')('auth')
const AuthError = require('./AuthError')

const {
  initiateSession,
  sessionByToken,
  NoSessionError
} = require('./Sessions')
const {
  generateNewToken,
  startChallenge,
  validateChallenge,
  TokenTypes
} = require('./challenges')

const ERROR_EMAIL_INVALID = 'email-invalid'
const ERROR_SESSION_INITIALIZATION_FAILED = 'session-initialization-failed'

class EmailInvalidError extends AuthError {
  constructor (meta) {
    super(ERROR_EMAIL_INVALID, meta)
  }
}

class SessionInitializationFailedError extends AuthError {
  constructor (meta) {
    super(ERROR_SESSION_INITIALIZATION_FAILED, meta)
  }
}

const {
  AUTO_LOGIN
} = process.env

const signIn = async (_email, context, pgdb, req) => {
  if (req.user) {
    return {phrase: ''}
  }

  if (!isEmail(_email)) {
    debug('invalid email: %O', {
      req: req._log(),
      _email
    })
    throw new EmailInvalidError({ email: _email })
  }

  // find existing email with different cases
  const email = (await pgdb.public.users.findOneFieldOnly({
    email: _email
  }, 'email')) || _email

  try {
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    const userAgent = req.headers['user-agent']

    const init = await initiateSession({ req, pgdb, ipAddress, userAgent, email })
    const { country, phrase, session } = init

    const type = TokenTypes.EMAIL_TOKEN
    const token = await generateNewToken({ pgdb, type, session })
    if (shouldAutoLogin({ email })) {
      setTimeout(async () => {
        console.log('AUTO_LOGIN!')
        await authorizeSession({
          pgdb,
          tokens: [token],
          email
        })
      }, 2000)
    } else {
      await startChallenge({ pgdb, email, type, token, context, country, phrase })
    }
    return { phrase }
  } catch (error) {
    throw new SessionInitializationFailedError({ error })
  }
}

const shouldAutoLogin = ({ email }) => {
  if (AUTO_LOGIN) {
    // email addresses @test.project-r.construction will be auto logged in
    // - email addresses containing «not» will neither be logged in nor send an sign request
    const testMatch = email.match(/^([a-zA-Z0-9._%+-]+)@test\.project-r\.construction$/)
    if (testMatch) {
      if (testMatch[1].indexOf('not') === -1) {
        return true
      }
    }
  }
  return false
}

const authorizeSession = async ({ pgdb, tokens, email: emailFromQuery, signInHooks = [] }) => {
  // validate the challenges
  const existingUser = await pgdb.public.users.findOne({ email: emailFromQuery })
  const sessions = []
  for (const tokenChallenge of tokens) {
    const session = await sessionByToken({ pgdb, token: tokenChallenge, email: emailFromQuery })
    const validated = await validateChallenge({ pgdb, session, user: existingUser, ...tokenChallenge })
    if (!validated) {
      console.error('invalid challenge ', tokenChallenge)
      throw new Error('one of the challenges failed')
    }
    sessions.push(session)
  }

  // security net
  if ([...(new Set(sessions))].length !== 1) {
    console.error('somebody tries to authorize multiple sessions')
    throw new NoSessionError({ email: emailFromQuery })
  }
  if (sessions.length < 2 && (existingUser && existingUser.isTwoFactorEnabled)) {
    console.error('two factor is enabled but less than 2 challenges provided')
    throw new NoSessionError({ email: emailFromQuery })
  }
  const session = sessions[0]

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

  // let the tokens expire
  await pgdb.public.tokens.delete({
    sessionId: session.id
  }, {
    updatedAt: new Date(),
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

const resolveUser = async ({ slug, pgdb, fallback }) => {
  const user = await pgdb.public.users.findOne(
  isUUID.v4(slug)
    ? {id: slug}
    : {username: slug})
  return user || fallback
}

module.exports = {
  signIn,
  authorizeSession,
  resolveUser,
  EmailInvalidError,
  SessionInitializationFailedError
}
