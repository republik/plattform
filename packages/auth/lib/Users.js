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

class EmailInvalidError extends AuthError {
  constructor (meta) {
    super('email-invalid', meta)
  }
  translatedMessage () {
    return t('api/email/invalid')
  }
}

class EmailAlreadyAssignedError extends AuthError {
  constructor (meta) {
    super('email-already-assigned', meta)
  }
  translatedMessage () {
    return t('api/email/change/exists')
  }
}

class SessionInitializationFailedError extends AuthError {
  constructor (meta) {
    super('session-initialization-failed', meta)
  }
  translatedMessage () {
    return t('api/auth/errorSavingSession')
  }
}

class UserNotFoundError extends AuthError {
  constructor (meta) {
    super('user-not-found', meta)
  }
  translatedMessage () {
    return t('api/users/404')
  }
}

class AuthorizationFailedError extends AuthError {
  constructor (meta) {
    super('authorization-failed', meta)
  }
}

const {
  AUTO_LOGIN,
  FRONTEND_BASE_URL
} = process.env

const signIn = async (_email, context, pgdb, req) => {
  if (req.user) {
    return { phrase: '', tokenTypes: [] }
  }

  if (!isEmail(_email)) {
    debug('invalid email: %O', {
      req: req._log(),
      _email
    })
    throw new EmailInvalidError({ email: _email })
  }

  // find existing email with different cases
  const user = await pgdb.public.users.findOne({
    email: _email
  })

  const { email, isTwoFactorEnabled } = user

  try {
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    const userAgent = req.headers['user-agent']

    const init = await initiateSession({ req, pgdb, ipAddress, userAgent, email })
    const { country, phrase, session } = init

    const type = TokenTypes.EMAIL_TOKEN
    const tokenTypes = [type]
    const token = await generateNewToken({
      pgdb,
      type,
      session,
      email
    })
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
      await startChallenge({
        pgdb,
        email,
        type,
        token,
        context,
        country,
        phrase
      })

      if (isTwoFactorEnabled) {
        const secondFactorType = TokenTypes.TOTP
        tokenTypes.push(secondFactorType)
        const secondFactor = await generateNewToken({
          pgdb,
          type: secondFactorType,
          session,
          email,
          user
        })
        await startChallenge({
          pgdb,
          email,
          type: secondFactorType,
          token: secondFactor,
          context,
          country,
          phrase
        })
      }
    }

    return { phrase, tokenTypes }
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

const denySession = async ({ pgdb, tokenChallenge, email: emailFromQuery }) => {
  // check if authorized to deny the challenge
  const existingUser = await pgdb.public.users.findOne({ email: emailFromQuery })
  const session = await sessionByToken({ pgdb, token: tokenChallenge, email: emailFromQuery })
  const validated = await validateChallenge({ pgdb, user: existingUser, ...tokenChallenge })
  if (!validated) {
    console.error('invalid challenge ', tokenChallenge)
    throw new Error('one of the challenges failed')
  }

  const transaction = await pgdb.transactionBegin()
  try {
    // log in the session and delete token
    await transaction.public.sessions.updateOne({
      id: session.id
    }, {
      sess: {
        ...session.sess,
        passport: {
          user: null
        },
        expire: (new Date()).getTime()
      }
    })

    // let the tokens expire
    await transaction.public.tokens.update({
      sessionId: session.id
    }, {
      updatedAt: new Date(),
      expiresAt: new Date()
    })
    transaction.transactionCommit()
  } catch (error) {
    transaction.transactionRollback()
    console.error('something failed badly during denial')
    throw new AuthorizationFailedError({ session })
  }
}

const authorizeSession = async ({ pgdb, tokens, email: emailFromQuery, signInHooks = [] }) => {
  // validate the challenges
  const existingUser = await pgdb.public.users.findOne({ email: emailFromQuery })
  const tokenTypes = []
  const sessions = []
  for (const tokenChallenge of tokens) {
    if (tokenTypes.indexOf(tokenChallenge.type) !== -1) {
      console.error('invalid challenge types ', tokenTypes.concat([tokenChallenge.type]))
      throw new Error('same challenge type used multiple times?!')
    }
    const session = await sessionByToken({ pgdb, token: tokenChallenge, email: emailFromQuery })
    const validated = await validateChallenge({ pgdb, user: existingUser, ...tokenChallenge })
    if (!validated) {
      console.error('invalid challenge ', tokenChallenge)
      throw new Error('one of the challenges failed')
    }
    tokenTypes.push(tokenChallenge.type)
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
    await transaction.public.tokens.update({
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

const updateUserTwoFactorAuthentication = async ({ pgdb, userId: id, enabled: isTwoFactorEnabled }) => {
  const transaction = await pgdb.transactionBegin()
  try {
    const user = await transaction.public.users.updateAndGetOne(
      {
        id
      }, {
        isTwoFactorEnabled
      }
    )
    await transaction.transactionCommit()
    return user
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
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
  denySession,
  authorizeSession,
  resolveUser,
  updateUserEmail,
  updateUserTwoFactorAuthentication,
  EmailInvalidError,
  EmailAlreadyAssignedError,
  UserNotFoundError,
  SessionInitializationFailedError
}
