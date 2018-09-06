const { ensureSignedIn } = require('@orbiting/backend-modules-auth')

module.exports = async (_, { oldToken, newToken }, { pgdb, req, user: me, t }) => {
  ensureSignedIn(req)

  const transaction = await pgdb.transactionBegin()
  try {
    const now = new Date()

    // ensure device exists and belongs to user
    const existingDevice = await transaction.public.devices.findOne({
      token: oldToken
    })
    if (!existingDevice) {
      throw new Error(t('api/devices/404'))
    }
    if (existingDevice.userId !== me.id) {
      throw new Error(t('api/device/notYours'))
    }

    const newDevice = await transaction.public.devices.updateAndGetOne(
      {
        id: existingDevice.id
      },
      {
        token: newToken,
        updatedAt: now
      }
    )

    await transaction.transactionCommit()

    return newDevice
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
