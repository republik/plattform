const querystring = require('querystring')
const isEmail = require('email-validator').validate
const isUUID = require('is-uuid')
const debug = require('debug')('auth')
const { sendMailTemplate, moveNewsletterSubscriptions } = require('@orbiting/backend-modules-mail')
const t = require('./t')
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
const ERROR_AUTHORIZATION_FAILED = 'authorization-failed'

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

class AuthorizationFailedError extends AuthError {
  constructor (meta) {
    super(ERROR_AUTHORIZATION_FAILED, meta)
  }
}

const {
  AUTO_LOGIN,
  FRONTEND_BASE_URL
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

  const transaction = await pgdb.transactionBegin()
  try {
    // log in the session and delete token
    await transaction.public.sessions.updateOne({
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
    await transaction.public.tokens.delete({
      sessionId: session.id
    }, {
      updatedAt: new Date(),
      expiresAt: new Date()
    })
    transaction.transactionCommit()
  } catch (error) {
    transaction.transactionRollback()
    console.error('something failed badly during authorization')
    throw new AuthorizationFailedError({ session })
  }

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
  const transaction = await pgdb.transactionBegin()
  try {
    const existingUser = await transaction.public.users.findOne({ email })
    const user = existingUser ||
      await transaction.public.users.insertAndGet({
        email,
        verified: true
      })
    if (!user.verified) {
      await transaction.public.users.updateOne({
        id: user.id
      }, {
        verified: true
      })
    }
    await transaction.transactionCommit()
    return {
      user,
      isVerificationUpdated: (!existingUser || !existingUser.verified)
    }
  } catch (error) {
    await transaction.transactionRollback()
    console.error('something bad happened during user verification')
    throw error
  }
}

const resolveUser = async ({ slug, pgdb, fallback }) => {
  const user = await pgdb.public.users.findOne(
  isUUID.v4(slug)
    ? {id: slug}
    : {username: slug})
  return user || fallback
}

const updateUserEmail = async ({ pgdb, userId, oldEmail, newEmail }) => {
  const transaction = await pgdb.transactionBegin()
  try {
    await transaction.public.sessions.delete(
      {
        'sess @>': {
          passport: {user: userId}
        }
      })
    await transaction.public.users.updateAndGetOne(
      {
        id: userId
      }, {
        email: newEmail,
        verified: false
      }
    )
    await transaction.transactionCommit()
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }

  await sendMailTemplate({
    to: oldEmail,
    fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
    subject: t('api/email/change/confirmation/subject'),
    templateName: 'cf_email_change_old_address',
    globalMergeVars: [
      { name: 'EMAIL',
        content: newEmail
      }
    ]
  })

  await sendMailTemplate({
    to: newEmail,
    fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
    subject: t('api/email/change/confirmation/subject'),
    templateName: 'cf_email_change_new_address',
    globalMergeVars: [
      { name: 'LOGIN_LINK',
        content: `${FRONTEND_BASE_URL}/konto?${querystring.stringify({ email: newEmail })}`
      }
    ]
  })

  const user = pgdb.public.users.findOne({ email: newEmail })

  try {
    await moveNewsletterSubscriptions({
      user: {
        email: oldEmail
      },
      newEmail
    })
  } catch (e) {
    console.error(e)
  }

  return user
}

module.exports = {
  signIn,
  authorizeSession,
  resolveUser,
  updateUserEmail,
  EmailInvalidError,
  SessionInitializationFailedError
}
