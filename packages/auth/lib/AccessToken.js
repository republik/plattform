const crypto = require('crypto')
const base64u = require('@orbiting/backend-modules-base64u')
const moment = require('moment')
const transformUser = require('./transformUser')

const { newAuthError } = require('./AuthError')
const MissingScopeError = newAuthError('missing-scope', 'api/auth/accessToken/scope/404')

const {
  CUSTOM_PLEDGE_TOKEN_HMAC_KEY
} = process.env
if (!CUSTOM_PLEDGE_TOKEN_HMAC_KEY) {
  console.warn('missing env CUSTOM_PLEDGE_TOKEN_HMAC_KEY, User.customPledgeToken will not work.')
}

const DATE_FORMAT = 'YYYY-MM-DD'

const scopeConfigs = {
  customPledge: {
    exposeFields: ['email', 'hasAddress', 'hasChargableSource', 'customPackages'],
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

const getHmac = (payload) => {
  if (!CUSTOM_PLEDGE_TOKEN_HMAC_KEY) {
    return null
  }
  return crypto
    .createHmac('sha256', CUSTOM_PLEDGE_TOKEN_HMAC_KEY)
    .update(payload)
    .digest('hex')
}

const getPayload = ({ userId, scope, expiresAt }) => {
  const expiresAtFormatted = moment(expiresAt).format(DATE_FORMAT)
  return `${userId}/${scope}/${expiresAtFormatted}`
}

const generateForUser = (userId, scope) => {
  if (!CUSTOM_PLEDGE_TOKEN_HMAC_KEY) {
    return null
  }
  const scopeConfig = getScopeConfig(scope)
  const payload = getPayload({
    userId,
    scope,
    expiresAt: moment().add(scopeConfig.ttlDays, 'days')
  })
  return base64u.encode(`${payload}/${getHmac(payload)}`)
}

const resolve = (token) => {
  const [userId, scope, _expiresAt, hmac] = base64u.decode(token).split('/')
  if (userId && scope && _expiresAt && hmac) {
    const expiresAt = moment(_expiresAt, DATE_FORMAT)
    if (getHmac(getPayload({ userId, scope, expiresAt })) === hmac) {
      const scopeConfig = getScopeConfig(scope)
      return { userId, scope, scopeConfig, expiresAt, hmac }
    }
  }
  return null
}

const getValidResolvedToken = (token) => {
  const resolvedToken = resolve(token)
  if (resolvedToken && resolvedToken.expiresAt.isAfter(moment())) {
    return resolvedToken
  }
  return null
}

const getUserByAccessToken = async (token, { pgdb }) => {
  const validToken = getValidResolvedToken(token)
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
  user._scopeConfig.exposeFields.includes(field)

module.exports = {
  generateForUser,
  getUserByAccessToken,
  isFieldExposed
}
