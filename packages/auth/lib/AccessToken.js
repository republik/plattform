const crypto = require('crypto')
const base64u = require('@orbiting/backend-modules-base64u')
const moment = require('moment')
const transformUser = require('./transformUser')

const { newAuthError } = require('./AuthError')
const MissingScopeError = newAuthError('missing-scope', 'api/auth/accessToken/scope/404')
const MissingKeyError = newAuthError('missing-key', 'api/auth/accessToken/key/404')
const MissingPackageGrant = newAuthError('missing-package-grant', 'api/auth/accessToken/pledgePackages/notAllowed')

const DATE_FORMAT = 'YYYY-MM-DD'

const scopeConfigs = {
  CUSTOM_PLEDGE: {
    exposeFields: ['email', 'firstName', 'lastName', 'hasAddress', 'paymentSources', 'customPackages'],
    pledgePackages: ['PROLONG', 'TABLEBOOK'],
    ttlDays: 90
  },
  CUSTOM_PLEDGE_EXTENDED: {
    exposeFields: ['email', 'firstName', 'lastName', 'hasAddress', 'paymentSources', 'customPackages'],
    pledgePackages: ['PROLONG'],
    ttlDays: 120
  },
  CLAIM_CARD: {
    exposeFields: ['email', 'cards'],
    ttlDays: 90
  }
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
  return crypto
    .createHmac('sha256', key)
    .update(payload)
    .digest('hex')
}

const getPayload = ({ userId, scope, expiresAt }) => {
  const expiresAtFormatted = moment(expiresAt).format(DATE_FORMAT)
  return `${userId}/${scope}/${expiresAtFormatted}`
}

const generateForUser = (user, scope) => {
  const key = user.accessKey || user._raw.accessKey
  if (!key) {
    throw new MissingKeyError()
  }
  const scopeConfig = getScopeConfig(scope)
  const payload = getPayload({
    userId: user.id,
    scope,
    expiresAt: moment().add(scopeConfig.ttlDays, 'days')
  })
  return base64u.encode(`${payload}/${getHmac(payload, key)}`)
}

const resolve = async (token, { pgdb }) => {
  const [userId, scope, _expiresAt, hmac] = base64u.decode(token).split('/')
  if (userId && scope && _expiresAt && hmac) {
    const expiresAt = moment(_expiresAt, DATE_FORMAT)
    const payload = getPayload({ userId, scope, expiresAt })
    const key = await pgdb.public.users.findOneFieldOnly({ id: userId }, 'accessKey')
    if (key && getHmac(payload, key) === hmac) {
      const scopeConfig = getScopeConfig(scope)
      return { userId, scope, scopeConfig, expiresAt, hmac }
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
        _scopeConfig: validToken.scopeConfig
      }
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
    !(user &&
      user._scopeConfig &&
      user._scopeConfig.pledgePackages &&
      user._scopeConfig.pledgePackages.includes(packageName)
    )
  ) {
    throw new MissingPackageGrant(null, { package: packageName })
  }
}

module.exports = {
  generateForUser,
  getUserByAccessToken,
  isFieldExposed,
  ensureCanPledgePackage
}
