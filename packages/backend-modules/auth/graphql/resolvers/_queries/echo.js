const { getClientIp } = require('@orbiting/backend-modules-base/lib/clientIp')
const geoForIP = require('../../../lib/geoForIP')
const useragent = require('../../../lib/useragent')

module.exports = async (_, args, { req }) => {
  const ip = getClientIp(req)
  const { country, countryEN, city } = await geoForIP(ip)
  const ua = req.headers['user-agent']

  return {
    ipAddress: ip,
    userAgent: useragent.detect(ua),
    isApp: useragent.isApp(ua),
    country,
    city,
  }
}
