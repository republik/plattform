const logger = console

const { ensureSignedIn } = require('@orbiting/backend-modules-auth')

const activateMembership = require('../../../lib/activateMembership')
const createCache = require('../../../lib/cache')

module.exports = async (_, args, context) => {
  const { pgdb, req, t, mail: { enforceSubscriptions, sendMembershipClaimNotice } } = context
  ensureSignedIn(req)

  let activatedMembership
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

    // A user can not claim a membership he owns.
    if (membership.userId === req.user.id) {
      throw new Error(t('api/membership/claim/ownerIsClaimer'))
    }
    activatedMembership = await activateMembership(membership, req.user, t, transaction)

    const cache = createCache({ prefix: `User:${req.user.id}` }, context)
    cache.invalidate()

    // commit transaction
    await transaction.transactionCommit()
  } catch (e) {
    await transaction.transactionRollback()
    logger.info('transaction rollback', { req: req._log(), args, error: e })
    throw e
  }

  if (activatedMembership) {
    try {
      await enforceSubscriptions({ pgdb, userId: activatedMembership.userId })
      await enforceSubscriptions({
        pgdb,
        userId: req.user.id,
        subscribeToEditorialNewsletters: true
      })
    } catch (e) {
      // ignore issues with newsletter subscriptions
      logger.error('newsletter subscription changes failed', { req: req._log(), args, error: e })
    }

    try {
      await sendMembershipClaimNotice({ membership: activatedMembership }, { pgdb, t })
    } catch (e) {
      logger.error('mail.sendMembershipClaimNotice failed', { req: req._log(), args, error: e })
    }
  }

  return true
}
