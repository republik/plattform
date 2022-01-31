const crypto = require('crypto')
const base64u = require('@orbiting/backend-modules-base64u')
const moment = require('moment')
const transformUser = require('./transformUser').default
const debug = require('debug')('auth:lib:AccessToken')

const { newAuthError } = require('./AuthError')
const { userIsMeOrInRoles, userIsInRoles } = require('./Roles')
const MissingScopeError = newAuthError(
  'missing-scope',
  'api/auth/accessToken/scope/404',
)
const MissingKeyError = newAuthError(
  'missing-key',
  'api/auth/accessToken/key/404',
)
const MissingPackageGrant = newAuthError(
  'missing-package-grant',
  'api/auth/accessToken/pledgePackages/notAllowed',
)

const scopeConfigs = {
  CUSTOM_PLEDGE: {
    exposeFields: [
      'email',
      'firstName',
      'lastName',
      'address',
      'hasAddress',
      'paymentSources',
      'customPackages',
    ],
    pledgePackages: ['PROLONG', 'TABLEBOOK'],
    ttlDays: 90,
  },
  CUSTOM_PLEDGE_EXTENDED: {
    exposeFields: [
      'email',
      'firstName',
      'lastName',
      'address',
      'hasAddress',
      'paymentSources',
      'customPackages',
    ],
    pledgePackages: ['PROLONG'],
    ttlDays: 120,
  },
  CLAIM_CARD: {
    exposeFields: ['email', 'cards'],
    ttlDays: 90,
  },
  AUTHORIZE_SESSION: {
    requiredRolesToGenerate: ['admin', 'supporter'],
    authorizeSession: true,
    ttlDays: 5,
    expireAtFormat: 'YYYY-MM-DDTHH:mm:ss.SSSZZ',
  },
  INVOICE: {
    allowedReqPaths: [
      /^\/invoices\/(.{6})\.pdf?$/,
      /^\/invoices\/paymentslip\/(.{6})\.pdf?$/,
    ],
    ttlDays: 5,
  },
}

const getScopeConfig = (scope) => {
  const scopeConfig = scopeConfigs[scope]
  if (!scopeConfig) {
    throw new MissingScopeError(null, { scope })
  }
  return scopeConfig
}

const getHmac = (payload, key) => {
  if (!key) {
    throw new MissingKeyError()
  }
  return crypto.createHmac('sha256', key).update(payload).digest('hex')
}

const getPayload = ({ userId, scope, expiresAt }) =>
  `${userId}/${scope}/${expiresAt}`

const generateForUser = (user, scope) => {
  const key = user.accessKey || user._raw.accessKey
  if (!key) {
    throw new MissingKeyError()
  }
  const { ttlDays, expireAtFormat = 'YYYY-MM-DD' } = getScopeConfig(scope)

  const payload = getPayload({
    userId: user.id,
    scope,
    expiresAt: moment().add(ttlDays, 'days').format(expireAtFormat),
  })

  return base64u.encode(`${payload}/${getHmac(payload, key)}`)
}

const generateForUserByUser = (user, scope, me, roles) => {
  // If either argument is missing, return null
  if (!user || !scope || !me || !roles) {
    debug('arguments missing')
    return null
  }

  // If user is not me or user is not in roles, return null
  if (!userIsMeOrInRoles(user, me, roles)) {
    debug('user is not me, or me is missing roles', { roles })
    return null
  }

  // If roles to generate are required and me is not in roles, return null
  const { requiredRolesToGenerate } = getScopeConfig(scope)
  if (requiredRolesToGenerate && !userIsInRoles(me, requiredRolesToGenerate)) {
    debug('scope requires roles, but me is missing them', {
      scope,
      requiredRolesToGenerate,
    })
    return null
  }

  return generateForUser(user, scope)
}

const resolve = async (token, { pgdb }) => {
  const [userId, scope, expiresAt, hmac] = base64u.decode(token).split('/')
  if (userId && scope && expiresAt && hmac) {
    const payload = getPayload({ userId, scope, expiresAt })
    const key = await pgdb.public.users.findOneFieldOnly(
      { id: userId },
      'accessKey',
    )
    if (key && getHmac(payload, key) === hmac) {
      const scopeConfig = getScopeConfig(scope)
      return { userId, scope, scopeConfig, expiresAt: moment(expiresAt), hmac }
    }
  }
  return null
}

const getValidResolvedToken = async (token, context) => {
  const resolvedToken = await resolve(token, context)
  if (resolvedToken && resolvedToken.expiresAt.isAfter(moment())) {
    return resolvedToken
  }
  return null
}

const getUserByAccessToken = async (token, context) => {
  const { pgdb } = context
  const validToken = await getValidResolvedToken(token, context)
  if (validToken) {
    // TODO: use loaders if discussion-refactor branch is merged
    return transformUser(
      await pgdb.public.users.findOne({ id: validToken.userId }),
      {
        _scopeConfig: validToken.scopeConfig,
      },
    )
  }
  return null
}

const isFieldExposed = (user, field) =>
  user &&
  user._scopeConfig &&
  user._scopeConfig.exposeFields &&
  user._scopeConfig.exposeFields.includes(field)

const ensureCanPledgePackage = (user, packageName) => {
  if (
    !(
      user &&
      user._scopeConfig &&
      user._scopeConfig.pledgePackages &&
      user._scopeConfig.pledgePackages.includes(packageName)
    )
  ) {
    throw new MissingPackageGrant(null, { package: packageName })
  }
}

const hasAuthorizeSession = (user) =>
  !!(user && user._scopeConfig && user._scopeConfig.authorizeSession)

const isReqPathAllowed = (user, req) =>
  !!user?._scopeConfig?.allowedReqPaths?.some((pattern) =>
    pattern.test(req.path),
  )

module.exports = {
  generateForUser,
  generateForUserByUser,
  getUserByAccessToken,
  isFieldExposed,
  ensureCanPledgePackage,
  hasAuthorizeSession,
  isReqPathAllowed,
}
