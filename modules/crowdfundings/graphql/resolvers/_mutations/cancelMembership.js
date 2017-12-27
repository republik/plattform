const cancelSubscription = require('../../../lib/payments/stripe/cancelSubscription')

module.exports = async (_, args, {pgdb, req, t}) => {
  const transaction = await pgdb.transactionBegin()
  try {
    const {
      id: membershipId,
      immediately = false
    } = args

    const membership = await transaction.public.memberships.findOne({
      id: membershipId
    })
    if (!membership) {
      throw new Error(t('api/membership/404'))
    }
    if (membership.active === false) {
      throw new Error(t('api/membership/cancel/isInactive'))
    }
    if (membership.renew === false) {
      throw new Error(t('api/membership/cancel/notRenewing'))
    }

    const membershipType = await transaction.public.membershipTypes.findOne({
      id: membership.membershipTypeId
    })

    if (membershipType === 'MONTHLY_ABO' && !membership.subscriptionId) {
      throw new Error(t('api/membership/pleaseWait'))
    }

    const newMembership = await transaction.public.memberships.updateAndGetOne({
      id: membershipId
    }, {
      renew: false,
      active: immediately
        ? false
        : membership.active,
      updatedAt: new Date()
    })

    if (membership.subscriptionId) {
      await cancelSubscription({
        id: membership.subscriptionId,
        companyId: membershipType.companyId,
        immediately,
        pgdb: transaction
      })
    }

    await transaction.transactionCommit()

    return newMembership
  } catch (e) {
    await transaction.transactionRollback()
    console.info('transaction rollback', { req: req._log(), args, error: e })
    throw e
  }
}
