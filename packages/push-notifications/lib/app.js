const { publish: publishFirebase } = require('./firebase')
const { publish: publishApn } = require('./apn')
const debug = require('debug')('notifications:publish')

const defaultTTL = 4 * 7 * 24 * 60 * 60 * 1000 // 4 weeks in ms, firebase default

const publish = async (userIds, args, { pgdb }) => {
  if (!args.ttl) {
    args.ttl = defaultTTL
  }

  const devices = await pgdb.public.devices.find(
    { userId: userIds }
  )

  const iosTokens = devices
    .filter(d => d.information.os === 'ios')
    .map(d => d.token)

  const androidTokens = devices
    .filter(d => d.information.os === 'android')
    .map(d => d.token)

  debug('sending notifications (apn: %d, firebase: %d)...', iosTokens.length, androidTokens.length)
  return Promise.all([
    publishApn({ tokens: iosTokens, ...args }, pgdb),
    publishFirebase({ tokens: androidTokens, ...args }, pgdb)
  ])
}

module.exports = {
  publish
}
