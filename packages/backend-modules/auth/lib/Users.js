const querystring = require('querystring')
const validator = require('validator')
const { parse, format } = require('libphonenumber-js')
const isUUID = require('is-uuid')
const Promise = require('bluebird')
const debug = require('debug')('auth:lib:Users')
const { sendMailTemplate } = require('@orbiting/backend-modules-mail')
const {
  changeEmailOnMailchimp,
} = require('@orbiting/backend-modules-mailchimp')
const t = require('./t')
const useragent = require('./useragent')
const AuthError = require('./AuthError')
const { ensureAllRequiredConsents, saveConsents } = require('./Consents')
const { ensureRequiredFields } = require('./Fields')
const { TranslatedError } = require('@orbiting/backend-modules-translate')
const UserEvents = require('./UserEvents')

const {
  initiateSession,
  sessionByToken,
  NoSessionError,
} = require('./Sessions')
const {
  generateNewToken,
  startChallenge,
  validateChallenge,
  TokenTypes,
} = require('./challenges')
const { getUserByAccessToken, hasAuthorizeSession } = require('./AccessToken')

const { newAuthError } = AuthError

const EmailInvalidError = newAuthError('email-invalid', 'api/email/invalid')
const EmailAlreadyAssignedError = newAuthError(
  'email-already-assigned',
  'api/email/change/exists',
)
const TokenTypeNotEnabledError = newAuthError(
  'token-type-not-enabled',
  'api/auth/tokenType/notEnabled',
)
const AccessTokenInvalidError = newAuthError(
  'access-token-type-invalid',
  'api/auth/errorAccessToken',
)
const SessionInitializationFailedError = newAuthError(
  'session-initialization-failed',
  'api/auth/errorSavingSession',
)
const UserNotFoundError = newAuthError('user-not-found', 'api/users/404')
const AuthorizationFailedError = newAuthError(
  'authorization-failed',
  'api/auth/authorization-failed',
)
const TwoFactorAlreadyDisabledError = newAuthError(
  '2fa-already-disabled',
  'api/auth/2fa-already-disabled',
)
const TwoFactorAlreadyEnabledError = newAuthError(
  '2fa-already-enabled',
  'api/auth/2fa-already-enabled',
)
const SecondFactorNotReadyError = newAuthError(
  '2f-not-ready',
  'api/auth/2f-not-ready',
)
const SecondFactorHasToBeDisabledError = newAuthError(
  'second-factor-has-to-be-disabled',
  'api/auth/second-factor-has-to-be-disabled',
)
const SessionTokenValidationFailed = newAuthError(
  'token-validation-failed',
  'api/token/invalid',
)
const AuthorizationRateLimitError = newAuthError(
  'authorize-rate-limit-tokens-email',
  'api/auth/errorAuthorizationRateLimit',
)

const { AUTO_LOGIN_REGEX, FRONTEND_BASE_URL } = process.env

// in order of preference
const enabledFirstFactors = async (email, pgdb) => {
  const userWithDevices = await pgdb
    .query(
      `
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
  `,
      {
        email,
      },
    )
    .then((result) => {
      const user = result[0]
      if (!user) {
        return user
      }
      return {
        ...user,
        devices: user.devices.filter(Boolean),
      }
    })

  const { APP, EMAIL_TOKEN } = TokenTypes

  const enabledTokenTypes = [EMAIL_TOKEN]
  if (userWithDevices && userWithDevices.devices.length > 0) {
    enabledTokenTypes.push(APP)
  }

  const { preferredFirstFactor } = userWithDevices || {}
  return enabledTokenTypes.sort((a, b) => {
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
  const availableTokenTypes = [APP, EMAIL_TOKEN]
  if (tokenType && availableTokenTypes.indexOf(tokenType) === -1) {
    throw new TokenTypeNotEnabledError({ tokenType })
  }
  return pgdb.public.users.updateAndGetOne(
    {
      id: user.id,
    },
    {
      preferredFirstFactor: tokenType,
    },
  )
}

const signIn = async (_email, signInContext, consents, _tokenType, accessToken, context) => {
  const { pgdb, req } = context
  if (req.user) {
    // req is authenticated
    return {
      phrase: '',
      tokenType: 'EMAIL_TOKEN',
      alternativeFirstFactors: [],
      expiresAt: new Date(),
    }
  }

  if (!validator.isEmail(_email)) {
    context.logger.debug({ email: _email }, 'invalid email')
    throw new EmailInvalidError({ email: _email })
  }

  // find existing email with different cases
  const user = await pgdb.public.users.findOne({
    email: _email,
  })

  const { email } = user || { email: _email }
  const isApp = useragent.isApp(req.headers['user-agent'])

  const { EMAIL_TOKEN, EMAIL_CODE, ACCESS_TOKEN } = TokenTypes

  // check if tokenType is enabled as firstFactor
  // email is always enabled
  const enabledTokenTypes = await enabledFirstFactors(email, pgdb)

  // Default to EMAIL_TOKEN if app is signin in
  let tokenType = _tokenType || (isApp && EMAIL_TOKEN)

  // Default to 1st record in {enabledTokenTypes}, or
  // check if tokenType is EMAIL_CODE
  if (!tokenType || tokenType !== EMAIL_TOKEN) {
    if (!tokenType) {
      tokenType = enabledTokenTypes[0]
    } else if (
      !enabledTokenTypes.includes(tokenType) &&
      ![EMAIL_CODE, ACCESS_TOKEN].includes(tokenType)
    ) {
      throw new TokenTypeNotEnabledError({ tokenType })
    }
  }

  try {
    const init = await initiateSession({ req, pgdb, email, consents })
    const { country, phrase, session } = init

    let token = null

    // Check {accessToken} and if valid, try to generate a token
    if (accessToken) {
      const accessTokenUser = await getUserByAccessToken(accessToken, { pgdb })

      // Check if scope has authorizeSession prop and requesting user matches accessToken user
      if (
        hasAuthorizeSession(accessTokenUser) &&
        user &&
        user.id === accessTokenUser.id
      ) {
        try {
          token = await generateNewToken(ACCESS_TOKEN, {
            pgdb,
            session,
            email,
            accessToken,
            context: signInContext,
          })
          tokenType = ACCESS_TOKEN
        } catch (e) {
          debug(e.message)

          if (tokenType === ACCESS_TOKEN) {
            throw e
          }
        }
      } else if (tokenType === ACCESS_TOKEN) {
        throw new AccessTokenInvalidError()
      }
    }

    if (!token) {
      token = await generateNewToken(tokenType, {
        pgdb,
        session,
        email,
        context: signInContext,
      })
    }

    if (shouldAutoLogin({ email })) {
      setTimeout(async () => {
        context.logger.warn(
          `🔓💥 Auto Login for ${email} due to AUTO_LOGIN_REGEX`,
        )
        await authorizeSession({
          pgdb,
          tokens: [token],
          email,
          req,
          me: user,
          logger: context.logger.child({}, { prefix: '[Auhtorize Session] ' }),
        })
      }, 2000)
    } else {
      await startChallenge(tokenType, {
        pgdb,
        email,
        token,
        context: signInContext,
        country,
        phrase,
        user,
      })
    }

    return {
      tokenType,
      phrase,
      expiresAt: token.expiresAt,
      alternativeFirstFactors: enabledTokenTypes.filter(
        (tt) => tt !== tokenType,
      ),
    }
  } catch (e) {
    console.error(e)

    if (e instanceof AuthError) {
      throw e
    }

    throw new SessionInitializationFailedError({ error: e })
  }
}

const shouldAutoLogin = ({ email }) => {
  if (process.env.NODE_ENV !== 'production' && AUTO_LOGIN_REGEX) {
    try {
      return new RegExp(AUTO_LOGIN_REGEX).test(email)
    } catch (e) {
      console.warn(e)
      return false
    }
  }
  return false
}

const unauthorizedSession = async ({
  pgdb,
  token,
  email: emailFromQuery,
  req,
  me,
}) => {
  if (!validator.isEmail(emailFromQuery)) {
    throw new EmailInvalidError({ email: emailFromQuery })
  }

  const existingUser = await pgdb.public.users.findOne({
    email: emailFromQuery,
  })
  const session = await sessionByToken({ pgdb, token, email: emailFromQuery })
  if (!session) {
    throw new NoSessionError({ email: emailFromQuery, token })
  }
  const validatable = await validateChallenge(
    token.type,
    { pgdb, session, email: emailFromQuery, user: existingUser, req, me },
    token,
  )
  if (!validatable) {
    throw new SessionTokenValidationFailed(token)
  }
  return session
}

const denySession = async ({ pgdb, token, email: emailFromQuery, me }) => {
  if (!validator.isEmail(emailFromQuery)) {
    throw new EmailInvalidError({ email: emailFromQuery })
  }

  // check if authorized to deny the challenge
  const session = await unauthorizedSession({
    pgdb,
    token,
    email: emailFromQuery,
    me,
  })

  const transaction = await pgdb.transactionBegin()
  try {
    // expire session and tokens
    await transaction.public.sessions.updateOne(
      {
        id: session.id,
      },
      {
        sess: {
          ...session.sess,
          passport: {
            user: null,
          },
          expire: new Date(),
        },
      },
    )

    await Promise.all([
      // let all tokens related to this session expire
      transaction.public.tokens.update(
        {
          sessionId: session.id,
        },
        {
          updatedAt: new Date(),
          expiresAt: new Date(),
        },
      ),
      // mark this token as denied
      transaction.public.tokens.updateOne(
        {
          sessionId: session.id,
          type: token.type,
          payload: token.payload,
        },
        {
          expireAction: 'deny',
        },
      ),
    ])

    await transaction.transactionCommit()
  } catch (error) {
    await transaction.transactionRollback()
    console.error(error)
    throw new AuthorizationFailedError({ session })
  }
  return true
}

const auditAuthorizeAttempts = async ({ pgdb, email, maxAttempts = 10 }) => {
  const transaction = await pgdb.transactionBegin()

  try {
    const sessions = await transaction.query(
      `
      SELECT
        s.*,
        MAX(t."expiresAt") AS "tokenExpiresAt"
      FROM
        sessions s
      JOIN tokens t
        ON t."sessionId" = s.id
      WHERE
        t.email = :email
        AND t."expiresAt" >= now()

      GROUP BY s.sid
    `,
      { email },
    )

    if (sessions.length === 0) {
      await transaction.transactionCommit()
      return
    }

    // Find token which expires next over all sessions
    const nextExpireAt = sessions.reduce((acc, curr) =>
      acc.tokenExpiresAt > curr.tokenExpiresAt ? curr : acc,
    ).tokenExpiresAt

    const minsNextExpireAt = Math.ceil((nextExpireAt - new Date()) / 1000 / 60)

    await Promise.map(sessions, async (session) => {
      await transaction.public.sessions.updateOne(
        { id: session.id },
        {
          sess: {
            ...session.sess,
            authorizeAttempts: ++session.sess.authorizeAttempts || 1,
          },
        },
      )

      if (session.sess.authorizeAttempts > maxAttempts) {
        throw new AuthorizationRateLimitError(
          {
            email,
            authorizeAttempts: session.sess.authorizeAttempts,
            maxAttempts,
          },
          {
            mins: minsNextExpireAt,
          },
        )
      }
    })

    await transaction.transactionCommit()
  } catch (e) {
    await transaction.transactionRollback()

    if (e.type === 'authorize-rate-limit-tokens-email') {
      throw e
    }

    console.error(e)

    throw new AuthorizationRateLimitError({
      email,
      maxAttempts,
    })
  }
}

const authorizeSession = async ({
  pgdb,
  tokens,
  email: emailFromQuery,
  signInHooks = [],
  consents = [],
  requiredFields = [],
  req,
  me,
  logger,
}) => {
  if (!validator.isEmail(emailFromQuery)) {
    throw new EmailInvalidError({ email: emailFromQuery })
  }

  await auditAuthorizeAttempts({ pgdb, email: emailFromQuery })

  // validate the challenges
  const existingUser = await pgdb.public.users.findOne({
    email: emailFromQuery,
  })
  const tokenTypes = []
  let session = null
  for (const token of tokens) {
    if (tokenTypes.indexOf(token.type) !== -1) {
      console.error(
        'invalid challenge, somebody uses the same type twice trying to circumvent 2fa',
        tokenTypes.concat([token.type]),
      )
      throw new SessionTokenValidationFailed({
        email: emailFromQuery,
        ...token,
      })
    }
    const curSession = await sessionByToken({
      pgdb,
      token,
      email: emailFromQuery,
    })
    if (curSession) {
      if (session && session.id !== curSession.id) {
        logger.error(
          { attemptedSession: session.id, currentSession: curSession.id },
          'multiple different session?!',
        )
        throw new SessionTokenValidationFailed({ email: emailFromQuery })
      }
      session = curSession
    } else if (!session) {
      logger.error('session is required to validate against')
      throw new SessionTokenValidationFailed({ email: emailFromQuery })
    }

    const validated = await validateChallenge(
      token.type,
      { pgdb, session, email: emailFromQuery, user: existingUser, req, me },
      token,
    )
    if (!validated) {
      console.error('unable to validate token')
      throw new SessionTokenValidationFailed({
        email: emailFromQuery,
        ...token,
      })
    }
    tokenTypes.push(token.type)
  }

  // security net
  if (
    tokenTypes.length < 2 &&
    existingUser &&
    existingUser.enabledSecondFactors &&
    existingUser.enabledSecondFactors.length > 0
  ) {
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
    ;({ user, isVerificationUpdated } = await upsertUserAndConsents({
      pgdb: transaction,
      email: session.sess.email,
      consents,
      requiredFields,
      req,
    }))
  } catch (error) {
    await transaction.transactionRollback()
    throw error
  }

  try {
    // log in the session and expire tokens
    await transaction.public.sessions.updateOne(
      {
        id: session.id,
      },
      {
        sess: {
          ...session.sess,
          passport: {
            user: user.id,
          },
        },
      },
    )

    await Promise.all([
      // let all tokens related to this session expire
      transaction.public.tokens.update(
        {
          sessionId: session.id,
        },
        {
          updatedAt: new Date(),
          expiresAt: new Date(),
        },
      ),
      // mark used tokens as authorized
      ...tokens.map((token) =>
        transaction.public.tokens.updateOne(
          {
            sessionId: session.id,
            type: token.type,
            payload: token.payload,
          },
          {
            expireAction: 'authorize',
          },
        ),
      ),
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
    const tokensUsed = await transaction.public.tokens.find(
      {
        payload: tokens.map((token) => token.payload),
        expireAction: 'authorize',
        'context !=': null,
      },
      { fields: ['context'] },
    )

    UserEvents.emitSignedIn({
      userId: user.id,
      isNew: isVerificationUpdated,
      contexts: tokensUsed.map((context) => context.context),
    })
    await Promise.all(
      signInHooks.map((hook) =>
        hook({
          userId: user.id,
          isNew: isVerificationUpdated,
          contexts: tokensUsed.map((context) => context.context),
          pgdb,
        }),
      ),
    )
  } catch (e) {
    logger.warn({ error: e }, 'sign in hook failed in authorizeSession')
  }

  return user
}

const upsertUserAndConsents = async ({
  pgdb,
  email,
  consents,
  requiredFields,
  req,
}) => {
  const existingUser = await pgdb.public.users.findOne({ email })
  let user = existingUser

  // check required consents
  await ensureAllRequiredConsents({
    pgdb,
    userId: user && user.id,
    consents,
  })

  const userFields = await ensureRequiredFields({
    user,
    email,
    providedFields: requiredFields,
    pgdb,
  })

  const updatedData = {
    ...userFields,
    ...(!user || !user.verified ? { verified: true } : undefined),
  }

  debug('upsertUserAndConsents', { updatedData })

  if (user && Object.keys(updatedData).length > 0) {
    debug('upsertUserAndConsents, updateAndGetOne')
    user = await pgdb.public.users.updateAndGetOne(
      { id: user.id },
      {
        ...updatedData,
        updatedAt: new Date(),
      },
    )
  } else if (!user) {
    debug('upsertUserAndConsents, insertAndGet')
    user = await pgdb.public.users.insertAndGet({
      ...updatedData,
      email,
    })
  }

  // save consents
  if (consents.length > 0) {
    await saveConsents({
      userId: user.id,
      consents,
      req,
      pgdb,
    })
  }

  return {
    user,
    isVerificationUpdated: !existingUser || !existingUser.verified,
  }
}

const resolveUser = async ({ slug, userId, pgdb }) => {
  const slugOrId = slug || userId
  const where = isUUID.v4(slugOrId) ? { id: slugOrId } : { username: slugOrId }

  return pgdb.public.users.findOne(where)
}

const updateUserTwoFactorAuthentication = async ({
  pgdb,
  userId: id,
  enabledSecondFactors,
}) => {
  const transaction = await pgdb.transactionBegin()
  try {
    const user = await transaction.public.users.updateAndGetOne(
      {
        id,
      },
      {
        enabledSecondFactors,
      },
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
    throw new SecondFactorHasToBeDisabledError({
      type: user.enabledSecondFactors[0],
    })
  }
  if (!validator.isEmail(email)) {
    throw new EmailInvalidError({ email })
  }
  if (await pgdb.public.users.count({ email })) {
    throw new EmailAlreadyAssignedError({ email })
  }

  const transaction = await pgdb.transactionBegin()
  try {
    await transaction.public.sessions.delete({
      'sess @>': {
        passport: { user: user.id },
      },
    })
    await transaction.public.users.updateOne(
      {
        id: user.id,
      },
      {
        email,
        verified: false,
      },
    )
    await transaction.transactionCommit()
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }

  await sendMailTemplate(
    {
      to: user.email,
      fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
      subject: t('api/email/change/confirmation/subject'),
      templateName: 'email_change_old_address',
      globalMergeVars: [
        {
          name: 'EMAIL',
          content: email,
        },
      ],
    },
    { pgdb },
  )

  await sendMailTemplate(
    {
      to: email,
      fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
      subject: t('api/email/change/confirmation/subject'),
      templateName: 'email_change_new_address',
      globalMergeVars: [
        {
          name: 'LOGIN_LINK',
          content: `${FRONTEND_BASE_URL}/konto?${querystring.stringify({
            email,
          })}`,
        },
      ],
    },
    { pgdb },
  )

  try {
    await changeEmailOnMailchimp({
      user,
      newEmail: email,
    })
  } catch (e) {
    console.error(e)
  }

  UserEvents.emitEmailUpdated({
    userId: user.id,
    previousEmail: user.email,
    newEmail: email,
  })

  // now refresh the user object and return that
  return pgdb.public.users.findOne({ email })
}

const updateUserPhoneNumber = async ({ pgdb, userId, phoneNumber }) => {
  const user = await pgdb.public.users.findOne({ id: userId })

  if (
    user.enabledSecondFactors &&
    user.enabledSecondFactors.indexOf(TokenTypes.SMS) !== -1
  ) {
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
      id: userId,
    },
    {
      phoneNumber, // save un-normalized phone number
    },
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
  SecondFactorNotReadyError,
  AuthorizationRateLimitError,
  UserEvents,
}
