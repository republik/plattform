const useragent = require('useragent')

const appRegex = /RepublikApp\/(\S+)/

// useragent@2.3.0 has an unpatched ReDoS on long input and the User-Agent
// header is attacker controlled (e.g. unauthenticated `echo` query).
// Real user agents are well below this.
const MAX_UA_LENGTH = 512

const limit = (ua) => String(ua).slice(0, MAX_UA_LENGTH)

module.exports.MAX_UA_LENGTH = MAX_UA_LENGTH

module.exports.detect = (rawUa) => {
  if (!rawUa) {
    return
  }
  const ua = limit(rawUa)

  const info = useragent.parse(ua)

  const match = ua.match(appRegex)
  if (match) {
    const version = match[1].split('/')[0] // remove bundleVersion
    return `Republik App ${version} / ${info.os.toString()} (${
      info.device.family
    })`
  }

  return info.toString()
}

module.exports.isApp = (ua) => {
  if (ua) {
    const match = limit(ua).match(appRegex)
    return !!match
  }

  return false
}
