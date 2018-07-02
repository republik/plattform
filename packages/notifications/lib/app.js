const firebase = require('./firebase')

module.exports = {
  async publish ({ userIds, title, body, url }, { pgdb }) {
    const deviceTokens = await pgdb.public.devices.findOneFieldOnly(
      { userId: userIds },
      'token'
    )

    if (deviceTokens.length > 0) {
      await firebase.messaging().sendToDevice(
        deviceTokens,
        {
          notification: {
            title,
            body
          },
          data: {
            url
          }
        }
      )
    }
  }
}
