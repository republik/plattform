const logger = console
const { ensureSignedIn, updateUserOnMailchimp } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, {pgdb, req, t}) => {
  ensureSignedIn(req, t)

  // if this restriction gets removed, make sure to check if
  // the membership doesn't already belong to the user, before
  // making the the transfer and removing the voucherCode
  if (await pgdb.public.memberships.count({userId: req.user.id})) { throw new Error(t('api/membership/claim/alreadyHave')) }

  const {voucherCode} = args
  const transaction = await pgdb.transactionBegin()
  let giverId
  try {
    const membership = await transaction.public.memberships.findOne({voucherCode})
    if (!membership) { throw new Error(t('api/membership/claim/invalidToken')) }
    giverId = membership.userId

    // transfer membership and remove voucherCode
    await transaction.public.memberships.updateOne({id: membership.id}, {
      userId: req.user.id,
      voucherCode: null,
      voucherable: false
    })

    // commit transaction
    await transaction.transactionCommit()
  } catch (e) {
    await transaction.transactionRollback()
    logger.info('transaction rollback', { req: req._log(), args, error: e })
    throw e
  }

  if (giverId) {
    updateUserOnMailchimp({
      userId: giverId,
      pgdb
    })
    updateUserOnMailchimp({
      userId: req.user.id,
      pgdb
    })
  }

  return true
}
