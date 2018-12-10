// https://developer.apple.com/library/archive/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/CommunicatingwithAPNs.html

const { deleteSessionForDevices } = require('./utils')

const apn = require('apn')
const debug = require('debug')('notifications:publish:apn')

const {
  SEND_NOTIFICATIONS,
  APN_KEY,
  APN_KEY_ID,
  APN_TEAM_ID,
  APN_BUNDLE_ID
} = process.env

const DEV = process.env.NODE_ENV && process.env.NODE_ENV !== 'production'

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

const publish = async (args, pgdb) => {
  if (SEND_NOTIFICATIONS === 'false' || (DEV && SEND_NOTIFICATIONS !== 'true')) {
    console.log('\n\nSEND_NOTIFICATIONS prevented notification from being sent\n(SEND_NOTIFICATIONS == false or NODE_ENV != production and SEND_NOTIFICATIONS != true)\n', args)
    return
  }
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
        ? { expiry: parseInt(new Date(now.getTime() + now.getTimezoneOffset() + ttl).getTime() / 1000) }
        : { }
    })
    const results = await Promise.all(
      tokens.map(token =>
        provider.send(message, token)
      )
    )
    debug('APN: #recipients %d, message: %O, results: %O', tokens.length, message, results)
    const staleTokens = results.reduce((acc, cur) => {
      const tokens = ((cur && cur.failed) || []).map(f => f.device)
      return acc.concat(tokens)
    }, [])
    if (staleTokens.length > 0) {
      await deleteSessionForDevices(staleTokens, pgdb)
      debug('deleted sessions for stale APN device tokens', staleTokens)
    }
  } else {
    debug('no receipients found for publish: %O', args)
  }
}

module.exports = {
  publish
}
