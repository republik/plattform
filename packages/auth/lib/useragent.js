const useragent = require('useragent')

const appRegex = /RepublikApp\/(.*)/

module.exports.detect = (ua) => {
  if (!ua) {
    return
  }

  const match = ua.match(appRegex)
  if (match) {
    const version = match[1]
    return `Republik App (${version})`
  }

  return useragent.parse(ua).toString()
}
