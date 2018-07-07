// https://firebase.google.com/docs/cloud-messaging/admin/legacy-fcm?authuser=1
// https://firebase.google.com/docs/cloud-messaging/admin/send-messages?authuser=1#defining_the_message
// https://developer.apple.com/library/archive/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/CommunicatingwithAPNs.html

const firebase = require('./firebase')
const debug = require('debug')('notifications:publish')

const FourWeeksMs = 4 * 7 * 24 * 60 * 60 * 1000 // firebase default

module.exports = {
  async publish (args, { pgdb }) {
    const { userIds, title, body, url, icon, type, ttl = FourWeeksMs, priority = 'normal' } = args

    const deviceTokens = await pgdb.public.devices.find(
      { userId: userIds }
    )
      .then(devices => devices
        .map(d => d.token)
      )
    if (deviceTokens.length > 0) {
      const message = {
        notification: {
          title,
          body
        },
        data: {
          url,
          ...icon
            ? { icon }
            : { },
          type
        }
        /* only supported on new API
        android: {
          ttl,
          priority
        },
        apns: {
          header: {
            // A UNIX epoch date expressed in seconds (UTC).
            'apns-expiration': parseInt(new Date(now.getTime() + now.getTimezoneOffset() + ttl).getTime() / 1000.0)
          }
        }
        */
      }
      const options = {
        timeToLive: parseInt(ttl / 1000.0),
        priority
      }
      const result = await firebase.messaging().sendToDevice(
        deviceTokens,
        message,
        options
      )
      debug('#recipients %d, message: %O, result: %O', deviceTokens.length, message, result)
    } else {
      debug('no receipients found for publish: %O', args)
    }
  }
}
