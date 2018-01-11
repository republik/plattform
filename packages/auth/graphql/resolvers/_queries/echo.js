const geoForIP = require('../../../lib/geoForIP')
const useragent = require('useragent')
const { flag, code } = require('country-emoji')

module.exports = async (_, args, { req }) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  const { country, countryEN, city } = geoForIP(ip)
  const countryCode = countryEN ? code(countryEN) : null
  const ua = req.headers['user-agent']

  return {
    ipAddress: ip,
    userAgent: ua && useragent.parse(ua).toString(),
    country,
    countryFlag: countryCode ? flag(countryCode) : '🏴',
    city
  }
}
