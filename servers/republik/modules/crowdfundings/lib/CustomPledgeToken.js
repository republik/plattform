const crypto = require('crypto')
const base64u = require('@orbiting/backend-modules-base64u')
const moment = require('moment')

const {
  CUSTOM_PLEDGE_TOKEN_HMAC_KEY
} = process.env
if (!CUSTOM_PLEDGE_TOKEN_HMAC_KEY) {
  console.warn('missing env CUSTOM_PLEDGE_TOKEN_HMAC_KEY, User.customPledgeToken will not work.')
}

const TTLDays = 90

const getHmac = (payload) => {
  if (!CUSTOM_PLEDGE_TOKEN_HMAC_KEY) {
    return null
  }
  return crypto
    .createHmac('sha256', CUSTOM_PLEDGE_TOKEN_HMAC_KEY)
    .update(payload)
    .digest('hex')
}

const generateForUser = (userId) => {
  if (!CUSTOM_PLEDGE_TOKEN_HMAC_KEY) {
    return null
  }
  const now = moment().format('YYYY-MM-DD')
  const payload = `${userId}/${now}`
  return base64u.encode(`${payload}/${getHmac(payload)}`)
}

const resolve = (token) => {
  try {
    const [userId, date, hmac] = base64u.decode(token).split('/')
    if (getHmac(`${userId}/${date}`) === hmac) {
      return {userId, date, hmac}
    }
  } catch (e) { }
  return null
}

const getValidResolvedToken = (token) => {
  const resolvedToken = resolve(token)
  if (resolvedToken && moment(resolvedToken.date).add(TTLDays, 'days').isAfter(moment())) {
    return resolvedToken
  }
  return null
}

const getUserId = (token) => {
  const validToken = getValidResolvedToken(token)
  return validToken && validToken.userId
}

module.exports = {
  generateForUser,
  getUserId
}
