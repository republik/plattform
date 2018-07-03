const firebase = require('./firebase')
const debug = require('debug')('notifications:publish')

module.exports = {
  async publish (args, { pgdb }) {
    const { userIds, title, body, url, icon, type } = args

    const deviceTokens = await pgdb.public.devices.findOneFieldOnly(
      { userId: userIds },
      'token'
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
      debug('#recipients %d, message: %O', deviceTokens.length, message)
      await firebase.messaging().sendToDevice(
        deviceTokens,
        message
      )
    } else {
      debug('no receipients found for publish: %O', args)
    }
  }
}
