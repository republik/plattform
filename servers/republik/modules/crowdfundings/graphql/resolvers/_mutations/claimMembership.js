const logger = console
const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const moment = require('moment')

module.exports = async (_, args, {pgdb, req, t, mail: {enforceSubscriptions}}) => {
  ensureSignedIn(req)

  let pledgerId
  const transaction = await pgdb.transactionBegin()

  try {
    // Throw an error if there is already an other active membership.
    if (
      await transaction.public.memberships.count({
        userId: req.user.id,
        active: true
      })
    ) {
      throw new Error(t('api/membership/claim/alreadyHave'))
    }

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

    const membershipType = await transaction.public.membershipTypes.findOne({
      id: membership.membershipTypeId
    })

    // transfer membership and remove voucherCode
    await transaction.public.memberships.updateOne(
      {
        id: membership.id
      }, {
        userId: req.user.id,
        voucherCode: null,
        voucherable: false,
        active: true,
        renew: true,
        updatedAt: now
      }
    )

    // generate interval
    const beginDate = moment(now)
    const endDate = moment(beginDate).add(
      membershipType.intervalCount,
      membershipType.interval
    )
    await transaction.public.membershipPeriods.insert({
      membershipId: membership.id,
      beginDate,
      endDate
    })

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
