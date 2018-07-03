const firebase = require('./firebase')
const debug = require('debug')('notifications:publish')

module.exports = {
  async publish (args, { pgdb }) {
    const { userIds, title, body, url, icon, type } = args

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
    /* This request would use the "new" API instead of the "legacy" one.
     * Sadly, it doesn't allow to send to multiple devices simultaniously
    if (deviceTokens.length > 0) {
      const notification = {
        title,
        body
      }
      const message = {
        data: {
          url,
          icon,
          type
        },
        android: {
          notification: {
            ...notification,
            icon,
            largeIcon: icon
          }
        },
        apns: {
          payload: {
            aps: {
              alert: {
                ...notification
              }
            },
          }
        }
      }
      debug('#recipients %d, message: %O, result: %O', deviceTokens.length, message)
      console.log(deviceTokens)
      const results = await Promise.all(
        deviceTokens.map( token =>
          firebase.messaging().send({
            ...message,
            token
          })
            .catch((error) => {
              const util = require('util')
              console.log('Error sending message:', util.inspect(error, 2, {depth: null}))
            })
        )
      )
      debug('results: %O', results)
    } else {
      debug('no receipients found for publish: %O', args)
    }
    */
  }
}
