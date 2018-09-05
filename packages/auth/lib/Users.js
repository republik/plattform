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
const TokenTypeNotEnabledError = newAuthError('token-type-not-enabled', 'api/auth/tokenType/notEnabled')
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

// in order of preference
const enabledFirstFactors = async (email, pgdb) => {
  const userWithDevices = await pgdb.query(`
    SELECT
      u.*,
      jsonb_agg(d.*) as devices
    FROM
      users u
    LEFT JOIN
      devices d
      ON u.id = d."userId"
    WHERE
      u.email = :email
    GROUP BY
      u.id
  `, {
    email
  })
    .then(result => {
      const user = result[0]
      if (!user) {
        return user
      }
      return {
        ...user,
        devices: user.devices
          .filter(Boolean)
      }
    })

  const { APP, EMAIL_TOKEN } = TokenTypes

  const enabledTokenTypes = [EMAIL_TOKEN]
  if (userWithDevices && userWithDevices.devices.length > 0) {
    enabledTokenTypes.push(APP)
  }

  const { preferredFirstFactor } = userWithDevices || {}
  return enabledTokenTypes
    .sort((a, b) => {
      if (a === b) {
        return 0
      }
      // preferred always wins
      if (a === preferredFirstFactor) {
        return -1
      }
      if (b === preferredFirstFactor) {
        return 1
      }
      // others are always before EMAIL_TOKEN
      if (b === EMAIL_TOKEN) {
        return -1
      }
      if (a === EMAIL_TOKEN) {
        return 1
      }
      // undefined order for others
      return 0
    })
}

// not restricted to enabledTokenTypes
const setPreferredFirstFactor = async (user, tokenType = null, pgdb) => {
  const { APP, EMAIL_TOKEN } = TokenTypes
  const availableTokenTypes = [ APP, EMAIL_TOKEN ]
  if (tokenType && availableTokenTypes.indexOf(tokenType) === -1) {
    throw new TokenTypeNotEnabledError({ tokenType })
  }
  return pgdb.public.users.updateAndGetOne(
    {
      id: user.id
    }, {
      preferredFirstFactor: tokenType
    }
  )
}

const signIn = async (_email, context, pgdb, req, consents, _tokenType) => {
  if (req.user) {
    // req is authenticated
    return {
      phrase: '',
      tokenType: 'EMAIL_TOKEN',
      alternativeFirstFactors: [],
      expiresAt: new Date()
    }
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

  const { EMAIL_TOKEN } = TokenTypes
  // check if tokenType is enabled as firstFactor
  // email is always enabled
  const enabledTokenTypes = await enabledFirstFactors(email, pgdb)
  let tokenType = _tokenType
  if (!tokenType || tokenType !== EMAIL_TOKEN) {
    if (!tokenType) {
      tokenType = enabledTokenTypes[0]
    } else if (enabledTokenTypes.indexOf(tokenType) === -1) {
      throw new TokenTypeNotEnabledError({ tokenType })
    }
  }

  try {
    const init = await initiateSession({ req, pgdb, email, consents })
    const { country, phrase, session } = init

    const token = await generateNewToken(tokenType, {
      pgdb,
      session,
      email,
      context
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
      await startChallenge(tokenType, {
        pgdb,
        email,
        token,
        context,
        country,
        phrase,
        user
      })
    }

    return {
      tokenType,
      phrase,
      expiresAt: token.expiresAt,
      alternativeFirstFactors: enabledTokenTypes.filter(tt => tt !== tokenType)
    }
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

const unauthorizedSession = async ({ pgdb, token, email: emailFromQuery, me }) => {
  const user = await pgdb.public.users.findOne({ email: emailFromQuery })
  const session = await sessionByToken({ pgdb, token, email: emailFromQuery })
  if (!session) {
    throw new NoSessionError({ email: emailFromQuery, token })
  }
  const validatable = await validateChallenge(token.type, { pgdb, user, session, me }, token)
  if (!validatable) {
    throw new SessionTokenValidationFailed(token)
  }
  return session
}

const denySession = async ({ pgdb, token, email: emailFromQuery, me }) => {
  // check if authorized to deny the challenge
  const session = await unauthorizedSession({ pgdb, token, email: emailFromQuery, me })

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

    await Promise.all([
      // let all tokens related to this session expire
      transaction.public.tokens.update({
        sessionId: session.id
      }, {
        updatedAt: new Date(),
        expiresAt: new Date()
      }),
      // mark this token as denied
      transaction.public.tokens.updateOne({
        ...token
      }, {
        expireAction: 'deny'
      })
    ])

    await transaction.transactionCommit()
  } catch (error) {
    await transaction.transactionRollback()
    console.error(error)
    throw new AuthorizationFailedError({ session })
  }
  return true
}

const authorizeSession = async ({ pgdb, tokens, email: emailFromQuery, signInHooks = [], consents = [], req, me }) => {
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

    const validated = await validateChallenge(token.type, { pgdb, session, user: existingUser, me }, token)
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

    await Promise.all([
      // let all tokens related to this session expire
      transaction.public.tokens.update({
        sessionId: session.id
      }, {
        updatedAt: new Date(),
        expiresAt: new Date()
      }),
      // mark this tokens as authorized
      ...tokens.map(token =>
        transaction.public.tokens.updateOne({
          ...token
        }, {
          expireAction: 'authorize'
        })
      )
    ])
    await transaction.transactionCommit()
  } catch (error) {
    await transaction.transactionRollback()
    console.error(error)
    throw new AuthorizationFailedError({ session: session })
  }

  // call signIn hooks
  try {
    // token context hooks
    const tokensUsed =
      await transaction.public.tokens.find(
        {
          payload: tokens.map(token => token.payload),
          expireAction: 'authorize',
          'context !=': null
        },
        { fields: ['context'] }
      )

    await Promise.all(
      signInHooks.map(hook =>
        hook({
          userId: user.id,
          isNew: isVerificationUpdated,
          contexts: tokensUsed.map(context => context.context),
          pgdb
        })
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
  enabledFirstFactors,
  setPreferredFirstFactor,
  signIn,
  unauthorizedSession,
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
