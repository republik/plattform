const firebase = require('./firebase')
const debug = require('debug')('notifications:publish')

module.exports = {
  async publish (args, { pgdb }) {
    const { userIds, title, body, url, icon, type } = args

    const deviceTokens = await pgdb.public.devices.find(
      { userId: userIds },
    )
      .then( devices => devices
        .map( d => d.token )
      )

    if (deviceTokens.length > 0) {
      const message = {
        notification: {
          title,
          body
        },
        data: {
          url,
          icon,
          type
        }
      }
      const result = await firebase.messaging().sendToDevice(
        deviceTokens,
        message
      )
      debug('#recipients %d, message: %O, result: %O', deviceTokens.length, message, result)
    } else {
      debug('no receipients found for publish: %O', args)
    }
  }
}
