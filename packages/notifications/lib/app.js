const firebase = require('./firebase')

module.exports = {
  async publish ({ userIds, title, body, url, icon, type }, { pgdb }) {
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
            url,
            icon,
            type
          }
        }
      )
    }
  }
}
