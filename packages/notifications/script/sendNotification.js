/**
 * This script sends a message to one device
 *
 * Usage:
 * node script/sendNotification.js email MESSAGE
 * node script/sendNotification.js ALL MESSAGE
 */
require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const { publish } = require('../lib/app')

const email = process.argv[2]
if (!email) {
  throw new Error('please provide email or ALL as the first argument')
}
const body = process.argv[3]
if (!body) {
  throw new Error('please provide the message as the second argument')
}

const message = {
  body,
  title: 'Republik [Test]',
  url: 'https://www.republik.ch',
  type: 'discussion'
}

PgDb.connect().then(async pgdb => {
  let userIds
  if (email === 'ALL') {
    console.log('sending message to ALL devices...')
    userIds = await pgdb.public.devices.find()
      .then(devices => devices
        .map(device => device.userId)
      )
    if (userIds && userIds.length) {
      userIds = [...new Set(userIds)]
    }
  } else {
    const user = await pgdb.public.users.findOne({ email })
    if (!user) {
      throw new Error(`user with email (${email}) not found!`)
    }
    userIds = [ user.id ]
  }

  console.log('publishing...', {userIds, message})

  await publish(userIds, message, { pgdb })
}).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
