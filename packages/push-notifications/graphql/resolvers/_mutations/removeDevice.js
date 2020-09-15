const { ensureSignedIn } = require('@orbiting/backend-modules-auth')

module.exports = async (_, { id }, { pgdb, req, user: me, t }) => {
  ensureSignedIn(req)

  const transaction = await pgdb.transactionBegin()
  try {
    // ensure device exists and belongs to user
    const device = await transaction.public.devices.findOne({ id })
    if (!device) {
      throw new Error(t('api/devices/404'))
    }
    if (device.userId !== me.id) {
      throw new Error(t('api/device/notYours'))
    }

    await transaction.public.devices.deleteOne({
      id,
    })

    await transaction.transactionCommit()

    return true
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
