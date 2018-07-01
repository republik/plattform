/**
 * This script sends a message to one device
 *
 * Usage:
 * node script/sendMessage.js TOKEN MESSAGE
 */
require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')
const firebase = require('../lib/firebase')
const util = require('util')

const _registrationToken = process.argv[2]
if (!_registrationToken) {
  throw new Error('please provide the device token or ALL as the first argument')
}
const body = process.argv[3]
if (!body) {
  throw new Error('please provide the message as the second argument')
}
const dryRun = process.argv[4] === 'dry'

const getMessage = () => {
  return {
    notification: {
      body,
      title: 'Republik [Test]'
    },
    data: {
      url: 'https://www.republik.ch'
    }
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

  await firebase.messaging().sendToDevice(
    tokens,
    getMessage(),
    {
      dryRun
    }
  )
    .then((response) => {
      console.log('Successfully sent message:', util.inspect(response, 2, {depth: null}))
    })
    .catch((error) => {
      console.log('Error sending message:', util.inspect(error, 2, {depth: null}))
    })
}).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
