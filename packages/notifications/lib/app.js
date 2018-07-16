const { publish: publishFirebase } = require('./firebase')
const { publish: publishiOS } = require('./apn')
const debug = require('debug')('notifications:publish')

const publish = async (userIds, args, { pgdb }) => {
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
    publishiOS({ tokens: iosTokens, ...args }),
    publishFirebase({ tokens: androidTokens, ...args })
  ])
}

module.exports = {
  publish
}
