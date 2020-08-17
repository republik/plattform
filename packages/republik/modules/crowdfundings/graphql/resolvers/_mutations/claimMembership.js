const logger = console

const { ensureSignedIn } = require('@orbiting/backend-modules-auth')

const activateMembership = require('../../../lib/activateMembership')
const createCache = require('../../../lib/cache')

module.exports = async (_, args, context) => {
  const { pgdb, req, t, mail: { enforceSubscriptions, sendMembershipClaimNotice } } = context
  ensureSignedIn(req)

  const transaction = await pgdb.transactionBegin()

  try {
    const { voucherCode } = args
    const membership = await transaction.public.memberships.findOne({
      voucherCode,
      voucherable: true,
      active: false
    })

    if (!membership) {
      throw new Error(t('api/membership/claim/invalidToken'))
    }

    const activatedMembership = await activateMembership(
      membership,
      req.user,
      t,
      transaction
    )

    // commit transaction
    await transaction.transactionCommit()

    const isSelfClaimed = membership.userId === activatedMembership.userId

    try {
      // Clear cache of claimer (if different to original owner)
      await createCache({ prefix: `User:${activatedMembership.userId}` }, context).invalidate()

      if (!isSelfClaimed) {
        // Clear cache of original owner
        await createCache({ prefix: `User:${membership.userId}` }, context).invalidate()
      }
    } catch (e) {
      // swallow cache invalidating errors
      logger.error('invalidating user caches failed', { req: req._log(), args, error: e })
    }

    try {
      await enforceSubscriptions({
        pgdb,
        userId: activatedMembership.userId,
        subscribeToEditorialNewsletters: !req.user.roles.includes('member')
      })
    } catch (e) {
      // ignore issues with newsletter subscriptions
      logger.error('newsletter subscription changes failed', { req: req._log(), args, error: e })
    }

    try {
      if (!isSelfClaimed) {
        await sendMembershipClaimNotice({ membership: activatedMembership }, { pgdb, t })
      }
    } catch (e) {
      logger.error('mail.sendMembershipClaimNotice failed', { req: req._log(), args, error: e })
    }
  } catch (e) {
    await transaction.transactionRollback()
    logger.info('transaction rollback', { req: req._log(), args, error: e })
    throw e
  }

  return true
}
