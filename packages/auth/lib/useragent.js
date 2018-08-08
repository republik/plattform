const useragent = require('useragent')

const appRegex = /RepublikApp\/(\S+)/

module.exports.detect = (ua) => {
  if (!ua) {
    return
  }

  const match = ua.match(appRegex)
  if (match) {
    const version = match[1].split('/')[0] // remove bundleVersion
    return `Republik App (${version})`
  }

  return useragent.parse(ua).toString()
}
