/**
 * This script sends a message to one device
 *
 * Usage:
 * node script/sendMessage.js TOKEN MESSAGE
 */
require('@orbiting/backend-modules-env').config()
const firebase = require('../lib/firebase')

const registrationToken = process.argv[2]
if (!registrationToken) {
  throw new Error('please provide the device token as the first argument')
}
const body = process.argv[3]
if (!body) {
  throw new Error('please provide the message as the second argument')
}

Promise.resolve().then(async () => {
  const title = 'Republik [TEST]'
  const message = {
    android: {
      ttl: 3600 * 1000, // 1 hour in milliseconds
      priority: 'normal',
      notification: {
        title,
        body,
        icon: 'stock_ticker_update',
        color: '#f45342'
      }
    },
    apns: {
      payload: {
        aps: {
          alert: {
            title,
            body
          },
          badge: 42
        }
      }
    },
    token: registrationToken
  }
  console.log(message)

  firebase.messaging().send(message)
    .then((response) => {
      console.log('Successfully sent message:', response)
    })
    .catch((error) => {
      console.log('Error sending message:', error)
    })
}).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
