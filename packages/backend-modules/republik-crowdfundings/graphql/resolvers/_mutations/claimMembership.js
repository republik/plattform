const logger = console

const { ensureSignedIn } = require('@orbiting/backend-modules-auth')

const activateMembership = require('../../../lib/activateMembership')
const createCache = require('../../../lib/cache')

module.exports = async (_, args, context) => {
  const {
    pgdb,
    req,
    t,
    mail: {
      enforceSubscriptions,
      sendMembershipClaimNotice,
      sendMembershipClaimerOnboarding,
    },
  } = context
  ensureSignedIn(req)

  const transaction = await pgdb.transactionBegin()

  try {
    const { voucherCode } = args
    const membership = await transaction.public.memberships.findOne({
      voucherCode,
      voucherable: true,
      active: false,
    })

    if (!membership) {
      throw new Error(t('api/membership/claim/invalidToken'))
    }

    const activeMembership = await transaction.public.memberships.findOne({
      userId: req.user.id,
      active: true,
    })

    const { claimedMembership, hasActiveMembership } = await activateMembership(
      membership,
      req.user,
      t,
      transaction,
    )

    // commit transaction
    await transaction.transactionCommit()

    const isSelfClaimed = membership.userId === claimedMembership.userId

    try {
      // Clear cache of claimer (if different to original owner)
      await createCache(
        { prefix: `User:${claimedMembership.userId}` },
        context,
      ).invalidate()

      if (!isSelfClaimed) {
        // Clear cache of original owner
        await createCache(
          { prefix: `User:${membership.userId}` },
          context,
        ).invalidate()
      }
    } catch (e) {
      // swallow cache invalidating errors
      logger.error('invalidating user caches failed', {
        req: req._log(),
        args,
        error: e,
      })
    }

    try {
      await enforceSubscriptions({
        pgdb,
        userId: claimedMembership.userId,
        subscribeToEditorialNewsletters: !req.user.roles.includes('member'),
        isFirstMembership: !hasActiveMembership,
      })
    } catch (e) {
      // ignore issues with newsletter subscriptions
      logger.error('newsletter subscription changes failed', {
        req: req._log(),
        args,
        error: e,
      })
    }

    try {
      if (!isSelfClaimed) {
        await sendMembershipClaimNotice(
          { membership: claimedMembership },
          { pgdb, t },
        )
      }
    } catch (e) {
      logger.error('mail.sendMembershipClaimNotice failed', {
        req: req._log(),
        args,
        error: e,
      })
    }
    try {
      await sendMembershipClaimerOnboarding(
        { claimedMembership, activeMembership },
        { pgdb, t },
      )
    } catch (e) {
      logger.error('mail.sendMembershipClaimerOnboarding failed', {
        req: req._log(),
        args,
        error: e,
      })
    }
  } catch (e) {
    await transaction.transactionRollback()
    logger.info('transaction rollback', { req: req._log(), args, error: e })
    throw e
  }

  return true
}
