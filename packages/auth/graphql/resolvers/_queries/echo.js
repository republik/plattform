const geoForIP = require('../../../lib/geoForIP')
const useragent = require('../../../lib/useragent')

module.exports = async (_, args, { req }) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  const { country, countryEN, city } = await geoForIP(ip)
  const ua = req.headers['user-agent']

  return {
    ipAddress: ip,
    userAgent: useragent.detect(ua),
    isApp: useragent.isApp(ua),
    country,
    city
  }
}
