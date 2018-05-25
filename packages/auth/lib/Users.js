const querystring = require('querystring')
const validator = require('validator')
const { parse, format } = require('libphonenumber-js')
const isUUID = require('is-uuid')
const debug = require('debug')('auth')
const { sendMailTemplate, moveNewsletterSubscriptions } = require('@orbiting/backend-modules-mail')
const t = require('./t')
const { newAuthError } = require('./AuthError')
const {
  ensureAllRequiredConsents,
  saveConsents
} = require('./Consents')
const { TranslatedError } = require('@orbiting/backend-modules-translate')

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

const EmailInvalidError = newAuthError('email-invalid', 'api/email/invalid')
const EmailAlreadyAssignedError = newAuthError('email-already-assigned', 'api/email/change/exists')
const SessionInitializationFailedError = newAuthError('session-initialization-failed', 'api/auth/errorSavingSession')
const UserNotFoundError = newAuthError('user-not-found', 'api/users/404')
const AuthorizationFailedError = newAuthError('authorization-failed', 'api/auth/authorization-failed')
const TwoFactorAlreadyDisabledError = newAuthError('2fa-already-disabled', 'api/auth/2fa-already-disabled')
const TwoFactorAlreadyEnabledError = newAuthError('2fa-already-enabled', 'api/auth/2fa-already-enabled')
const SecondFactorNotReadyError = newAuthError('2f-not-ready', 'api/auth/2f-not-ready')
const SecondFactorHasToBeDisabledError = newAuthError('second-factor-has-to-be-disabled', 'api/auth/second-factor-has-to-be-disabled')
const SessionTokenValidationFailed = newAuthError('token-validation-failed', 'api/token/invalid')

const {
  AUTO_LOGIN,
  FRONTEND_BASE_URL
} = process.env

const signIn = async (_email, context, pgdb, req, consents) => {
  if (req.user) {
    return { phrase: '' }
  }

  if (!validator.isEmail(_email)) {
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

  const { email } = (user || { email: _email })

  try {
    const init = await initiateSession({ req, pgdb, email, consents })
    const { country, phrase, session } = init

    const type = TokenTypes.EMAIL_TOKEN
    const token = await generateNewToken(type, {
      pgdb,
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
      await startChallenge(type, {
        pgdb,
        email,
        token,
        context,
        country,
        phrase
      })
    }

    return { phrase }
  } catch (error) {
    console.error(error)
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

const denySession = async ({ pgdb, token, email: emailFromQuery }) => {
  // check if authorized to deny the challenge
  const user = await pgdb.public.users.findOne({ email: emailFromQuery })
  const session = await sessionByToken({ pgdb, token, email: emailFromQuery })
  if (!session) {
    throw new NoSessionError({ email: emailFromQuery, token })
  }
  const validated = await validateChallenge(token.type, { pgdb, user, session }, token)
  if (!validated) {
    throw new SessionTokenValidationFailed(token)
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
        expire: new Date()
      }
    })

    // let the tokens expire
    await transaction.public.tokens.update({
      sessionId: session.id
    }, {
      updatedAt: new Date(),
      expiresAt: new Date()
    })
    await transaction.transactionCommit()
  } catch (error) {
    await transaction.transactionRollback()
    throw new AuthorizationFailedError({ session })
  }
  return user
}

const authorizeSession = async ({ pgdb, tokens, email: emailFromQuery, signInHooks = [], consents = [], req }) => {
  // validate the challenges
  const existingUser = await pgdb.public.users.findOne({ email: emailFromQuery })
  const tokenTypes = []
  let session = null
  for (const token of tokens) {
    if (tokenTypes.indexOf(token.type) !== -1) {
      console.error('invalid challenge, somebody uses the same type twice trying to circumvent 2fa', tokenTypes.concat([token.type]))
      throw new SessionTokenValidationFailed({ email: emailFromQuery, ...token })
    }
    const curSession = await sessionByToken({ pgdb, token, email: emailFromQuery })
    if (curSession) {
      if (session && session.id !== curSession.id) {
        console.error('multiple different session?!')
        throw new SessionTokenValidationFailed({ email: emailFromQuery })
      }
      session = curSession
    } else if (!session) {
      console.error('session is required to validate against')
      throw new SessionTokenValidationFailed({ email: emailFromQuery })
    }

    const validated = await validateChallenge(token.type, { pgdb, session, user: existingUser }, token)
    if (!validated) {
      console.error('wrong token')
      throw new SessionTokenValidationFailed({ email: emailFromQuery, ...token })
    }
    tokenTypes.push(token.type)
  }

  // security net
  if (tokenTypes.length < 2 && (existingUser && existingUser.enabledSecondFactors && existingUser.enabledSecondFactors.length > 0)) {
    console.error('two factor is enabled but less than 2 challenges provided')
    throw new SessionTokenValidationFailed({ email: emailFromQuery })
  }

  // merge consents given to authorizeSession and signIn
  if (session.sess.consents) {
    consents = [...new Set(consents.concat(session.sess.consents))]
  }

  const transaction = await pgdb.transactionBegin()

  // verify and/or create the user (checks consents)
  let user, isVerificationUpdated
  try {
    ({ user, isVerificationUpdated } = await upsertUserAndConsents({
      pgdb: transaction,
      email: session.sess.email,
      consents,
      req
    }))
  } catch (error) {
    await transaction.transactionRollback()
    throw error
  }

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
    await transaction.transactionCommit()
  } catch (error) {
    await transaction.transactionRollback()
    console.error(error)
    throw new AuthorizationFailedError({ session: session })
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

const upsertUserAndConsents = async ({ pgdb, email, consents, req }) => {
  const existingUser = await pgdb.public.users.findOne({ email })

  // check required consents
  await ensureAllRequiredConsents({
    pgdb,
    userId: existingUser && existingUser.id,
    consents
  })

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

  // save consents
  if (consents.length > 0) {
    await saveConsents({
      userId: user.id,
      consents,
      req,
      pgdb
    })
  }

  return {
    user,
    isVerificationUpdated: (!existingUser || !existingUser.verified)
  }
}

const resolveUser = async ({ slug, pgdb, userId }) => {
  const slugOrId = slug || userId
  const where = isUUID.v4(slugOrId)
    ? { id: slugOrId }
    : { username: slugOrId }

  return pgdb.public.users.findOne(where)
}

const updateUserTwoFactorAuthentication = async ({ pgdb, userId: id, enabledSecondFactors }) => {
  const transaction = await pgdb.transactionBegin()
  try {
    const user = await transaction.public.users.updateAndGetOne(
      {
        id
      }, {
        enabledSecondFactors
      }
    )
    await transaction.transactionCommit()
    return user
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}

const updateUserEmail = async ({ pgdb, user, email }) => {
  if (user.enabledSecondFactors && user.enabledSecondFactors.length > 0) {
    throw new SecondFactorHasToBeDisabledError({ type: user.enabledSecondFactors[0] })
  }
  if (!validator.isEmail(email)) {
    throw new EmailInvalidError({ email })
  }
  if (await pgdb.public.users.count({ email })) {
    throw new EmailAlreadyAssignedError({ email })
  }

  const transaction = await pgdb.transactionBegin()
  try {
    await transaction.public.sessions.delete(
      {
        'sess @>': {
          passport: {user: user.id}
        }
      })
    await transaction.public.users.updateOne(
      {
        id: user.id
      }, {
        email,
        verified: false
      }
    )
    await transaction.transactionCommit()
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }

  await sendMailTemplate({
    to: user.email,
    fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
    subject: t('api/email/change/confirmation/subject'),
    templateName: 'cf_email_change_old_address',
    globalMergeVars: [
      { name: 'EMAIL',
        content: email
      }
    ]
  })

  await sendMailTemplate({
    to: email,
    fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
    subject: t('api/email/change/confirmation/subject'),
    templateName: 'cf_email_change_new_address',
    globalMergeVars: [
      { name: 'LOGIN_LINK',
        content: `${FRONTEND_BASE_URL}/konto?${querystring.stringify({ email })}`
      }
    ]
  })

  try {
    await moveNewsletterSubscriptions({
      user,
      newEmail: email
    })
  } catch (e) {
    console.error(e)
  }

  // now refresh the user object and return that
  return pgdb.public.users.findOne({ email })
}

const updateUserPhoneNumber = async ({ pgdb, userId, phoneNumber }) => {
  const user = await pgdb.public.users.findOne({ id: userId })

  if (user.enabledSecondFactors && user.enabledSecondFactors.indexOf(TokenTypes.SMS) !== -1) {
    throw new SecondFactorHasToBeDisabledError({ type: TokenTypes.SMS })
  }

  try {
    const parsedPhoneNumber = parse(phoneNumber || '', 'CH') // it could be any arbitrary string
    format(parsedPhoneNumber.phone, parsedPhoneNumber.country, 'E.164')
  } catch (e) {
    throw new TranslatedError(t('api/auth/sms/phone-number-not-valid'))
  }

  return pgdb.public.users.updateAndGetOne(
    {
      id: userId
    }, {
      phoneNumber, // save un-normalized phone number
      isPhoneNumberVerified: false
    }
  )
}

module.exports = {
  signIn,
  denySession,
  authorizeSession,
  resolveUser,
  updateUserEmail,
  updateUserPhoneNumber,
  updateUserTwoFactorAuthentication,
  upsertUserAndConsents,
  EmailInvalidError,
  EmailAlreadyAssignedError,
  UserNotFoundError,
  SessionInitializationFailedError,
  SessionTokenValidationFailed,
  SecondFactorHasToBeDisabledError,
  TwoFactorAlreadyDisabledError,
  TwoFactorAlreadyEnabledError,
  SecondFactorNotReadyError
}
