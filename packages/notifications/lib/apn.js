const apn = require('apn')
const debug = require('debug')('notifications:publish:apn')

const {
  APN_KEY,
  APN_KEY_ID,
  APN_TEAM_ID,
  APN_BUNDLE_ID
} = process.env

// singleton
let provider
if (!APN_KEY || !APN_KEY_ID || !APN_TEAM_ID || !APN_BUNDLE_ID) {
  console.warn('missing env APN_*, sending push notifications via apn will not work')
} else {
  const options = {
    token: {
      keyId: APN_KEY_ID,
      teamId: APN_TEAM_ID,
      key: APN_KEY
        .replace(/@/g, '\n')
        .replace(/\\\s/g, ' ')
    }
  }
  provider = new apn.Provider(options)
}

const publish = async (args) => {
  if (!provider) {
    throw new Error(`mssing env APN_*, can't publish`)
  }

  const { tokens, title, body, url, icon, type, ttl } = args
  const now = new Date()

  if (tokens.length > 0) {
    const message = new apn.Notification({
      title,
      body,
      payload: {
        url,
        type,
        ...icon
          ? { icon }
          : {}
      },
      topic: APN_BUNDLE_ID,
      ...ttl // A UNIX epoch date expressed in seconds (UTC).
        ? { expiry: parseInt(new Date(now.getTime() + now.getTimezoneOffset() + ttl).getTime() / 1000.0) }
        : { }
    })
    debug('sending %d notifications...', tokens.length)
    return Promise.all(
      tokens.map(token =>
        provider.send(message, token)
      )
    )
  } else {
    debug('no receipients found for publish: %O', args)
  }
}

module.exports = {
  publish
}
