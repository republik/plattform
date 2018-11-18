const { ensureSignedIn } = require('@orbiting/backend-modules-auth')

const { disableAutoPay } = require('../../../lib/Membership')

module.exports = async (_, args, { pgdb, req }) => {
  ensureSignedIn(req)

  const transaction = await pgdb.transactionBegin()

  try {
    const { id: membershipId } = args
    const { user: { id: userId } } = req

    await disableAutoPay({ membershipId, userId, pgdb: transaction })

    // commit transaction
    await transaction.transactionCommit()

    return true
  } catch (e) {
    console.error('enableMembershipAutoPay', e, { req: req._log() })
    await transaction.transactionRollback()
    throw e
  }
}
