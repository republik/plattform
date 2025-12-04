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

    const { updatedMembership: claimedMembership, hasActiveMembership } =
      await activateMembership(membership, req.user, t, transaction)

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
      context.logger.error(
        {
          args,
          error: e,
        },
        'invalidating user caches failed',
      )
    }

    try {
      await enforceSubscriptions({
        pgdb,
        userId: claimedMembership.userId,
        subscribeToEditorialNewsletters: !req.user.roles.includes('member'),
        subscribeToOnboardingMails: !hasActiveMembership,
      })
    } catch (e) {
      // ignore issues with newsletter subscriptions
      context.logger.error(
        {
          args,
          error: e,
        },
        'newsletter subscription changes failed',
      )
    }

    try {
      if (!isSelfClaimed) {
        await sendMembershipClaimNotice(
          { membership: claimedMembership },
          { pgdb, t },
        )
      }
    } catch (e) {
      context.logger.error(
        {
          args,
          error: e,
        },
        'mail.sendMembershipClaimNotice failed',
      )
    }
    try {
      await sendMembershipClaimerOnboarding(
        { claimedMembership, activeMembership },
        { pgdb, t },
      )
    } catch (e) {
      context.logger.error(
        {
          args,
          error: e,
        },
        'mail.sendMembershipClaimerOnboarding failed',
      )
    }
  } catch (e) {
    await transaction.transactionRollback()
    context.logger.error({ args, error: e }, 'claim membership failed')
    throw e
  }

  return true
}
