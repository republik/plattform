const { ensureSignedIn, Sessions: { sessionBySId } } = require('@orbiting/backend-modules-auth')
const debug = require('debug')('notifications:devices:upsertDevice')

const getSessionId = async (req, pgdb) => {
  const session = await sessionBySId({
    pgdb,
    sid: req.sessionID
  })
  return session.id
}

module.exports = async (_, { token, information }, { pgdb, user: me, req, t }) => {
  ensureSignedIn(req)

  const sessionId = await getSessionId(req, pgdb)
  const transaction = await pgdb.transactionBegin()
  try {
    let device
    const now = new Date()

    // check if device exists already
    const existingDevice = await transaction.public.devices.findOne({
      or: [
        { token },
        { sessionId }
      ]
    })
    if (existingDevice) {
      debug('found existing device %O', existingDevice)
      const update = {}
      if (existingDevice.userId !== me.id) {
        debug('changing ownership of existing device. oldUser: %s newUser: %s', existingDevice.userId, me.id)
        update.userId = me.id
      }
      if (existingDevice.sessionId !== sessionId) {
        debug('changing sessing of existing device')
        update.sessionId = sessionId
      }
      if (existingDevice.token !== token) {
        debug('changing token of existing device')
        update.token = token
      }
      device = await transaction.public.devices.updateAndGetOne({ id: existingDevice.id }, {
        ...update,
        ...information ? { information } : {},
        updatedAt: now
      })
    } else {
      if (!information) {
        console.error('information required for device insert', { token, information })
        throw new Error(t('api/unexpected'))
      }
      device = await transaction.public.devices.insertAndGet({
        userId: me.id,
        sessionId,
        token,
        information
      })
    }

    // remember enrollment, update notificationChannels
    if (!me._raw.hadDevice) {
      await transaction.query(`
        UPDATE
          users
        SET
          "hadDevice" = true
          ${me._raw.discussionNotificationChannels.indexOf('APP') === -1 // avoid duplicates
    ? ', "discussionNotificationChannels" = "discussionNotificationChannels" || \'["APP"]\''
    : ''
}
        WHERE
          id = :userId
      `, {
        userId: me.id
      })
    }

    await transaction.transactionCommit()
    return device
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
