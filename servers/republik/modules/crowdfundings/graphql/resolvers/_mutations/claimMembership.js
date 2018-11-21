const logger = console
const moment = require('moment')

const { ensureSignedIn } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, {pgdb, req, t, mail: {enforceSubscriptions}}) => {
  ensureSignedIn(req)

  let pledgerId
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

    const now = new Date()

    pledgerId = membership.userId

    const hasActiveMembership = (await transaction.public.memberships.count({
      userId: req.user.id,
      active: true
    })) > 0

    // transfer membership and remove voucherCode
    await transaction.public.memberships.updateOne(
      { id: membership.id },
      {
        userId: req.user.id,
        voucherCode: null,
        voucherable: false,
        // Set added membership.active to false if other memberschip is still
        // active.
        active: !hasActiveMembership,
        renew: !hasActiveMembership,
        updatedAt: now
      }
    )

    if (!hasActiveMembership) {
      const { intervalCount, interval } =
        await transaction.public.membershipTypes.findOne({
          id: membership.membershipTypeId
        })

      // generate interval
      const beginDate = moment(now)
      const endDate = moment(beginDate).add(intervalCount, interval)

      await transaction.public.membershipPeriods.insert({
        membershipId: membership.id,
        beginDate,
        endDate
      })
    } else {
      // Set membership.renewal to false for active membership
      await transaction.public.memberships.update(
        { userId: req.user.id, active: true },
        {
          renew: false,
          updatedAt: now
        }
      )

      // @TODO: submit "cancel reason", a new abo is coming up.
    }

    // commit transaction
    await transaction.transactionCommit()
  } catch (e) {
    await transaction.transactionRollback()
    logger.info('transaction rollback', { req: req._log(), args, error: e })
    throw e
  }

  if (pledgerId) {
    try {
      await enforceSubscriptions({ pgdb, userId: pledgerId })
      await enforceSubscriptions({
        pgdb,
        userId: req.user.id,
        subscribeToEditorialNewsletters: true
      })
    } catch (e) {
      // ignore issues with newsletter subscriptions
      logger.error('newsletter subscription changes failed', { req: req._log(), args, error: e })
    }
  }

  return true
}
