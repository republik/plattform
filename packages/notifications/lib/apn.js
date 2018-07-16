const apn = require('apn')
const debug = require('debug')('notifications:publish:apn')

const {
  APN_KEY,
  APN_KEY_ID,
  APN_TEAM_ID,
  APN_BUNDLE_ID
} = process.env

const options = {
  token: {
    keyId: APN_KEY_ID,
    teamId: APN_TEAM_ID,
    key: APN_KEY
      .replace(/@/g, '\n')
      .replace(/\\\s/g, ' ')
  }
}

// singleton
const provider = new apn.Provider(options)

const publish = async (args) => {
  const { tokens, title, body, url, icon, type } = args

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
      topic: APN_BUNDLE_ID
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
