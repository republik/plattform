const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const debug = require('debug')('notifications:devices:upsertDevice')

module.exports = async (_, { token, information }, { pgdb, user: me, req }) => {
  ensureSignedIn(req)
  const {
    sessionID: sessionId
  } = req

  const transaction = await pgdb.transactionBegin()
  try {
    let device
    const now = new Date()

    // check if device exists already
    const existingDevice = await transaction.public.devices.findOne({
      token
    })
    if (existingDevice) {
      debug('found existing device %O', existingDevice)
      const update = {}
      if (existingDevice.userId !== me.id) {
        debug('changing ownership of existing device. oldUser: %s newUser: %s', existingDevice.userId, me.id)
        update.userId = me.id
      }
      if (existingDevice.session !== sessionId) {
        debug('changing sessing of existing device')
        update.sessionId = sessionId
      }
      device = await transaction.public.devices.updateAndGetOne({ id: existingDevice.id }, {
        ...update,
        information,
        updatedAt: now
      })
    } else {
      device = await transaction.public.devices.insertAndGet({
        userId: me.id,
        sessionId,
        token,
        information
      })
    }

    await transaction.transactionCommit()
    console.log(device)
    return device
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
