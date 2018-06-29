/**
 * This script sends a message to one device
 *
 * Usage:
 * node script/sendMessage.js TOKEN MESSAGE
 */
require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')
const firebase = require('../lib/firebase')

const _registrationToken = process.argv[2]
if (!_registrationToken) {
  throw new Error('please provide the device token or ALL as the first argument')
}
const body = process.argv[3]
if (!body) {
  throw new Error('please provide the message as the second argument')
}

const getMessage = () => {
  const title = process.argv[4] || 'Republik [TEST]'
  return {
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
          }
        }
      }
    }
    // token: registrationToken
  }
}

PgDb.connect().then(async pgdb => {
  let tokens = [_registrationToken]
  if (_registrationToken === 'ALL') {
    console.log('sending message to ALL devices...')
    tokens = await pgdb.public.devices.find()
      .then(devices => devices
        .map(device => device.token)
      )
  }

  const message = getMessage()
  console.log({tokens, message})

  await Promise.all(
    tokens.map(token => {
      return firebase.messaging().send({
        ...message,
        token
      })
        .then((response) => {
          console.log('Successfully sent message:', response)
        })
        .catch((error) => {
          console.log('Error sending message:', error)
        })
    })
  )
}).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
