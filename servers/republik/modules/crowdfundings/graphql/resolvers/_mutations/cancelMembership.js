const { Roles } = require('@orbiting/backend-modules-auth')
const cancelSubscription = require('../../../lib/payments/stripe/cancelSubscription')
const slack = require('../../../../../lib/slack')

module.exports = async (
  _,
  args,
  {
    pgdb,
    transaction: pgdbTransaction,
    req,
    t
  }) => {
  const transaction = await pgdbTransaction || pgdb.transactionBegin()
  try {
    const {
      id: membershipId,
      immediately = false,
      reason
    } = args

    const membership = await transaction.query(`
      SELECT
        m.*
      FROM
        memberships m
      WHERE
        id = :membershipId
      FOR UPDATE
    `, {
      membershipId
    })
      .then(result => result[0])
    if (!membership) {
      throw new Error(t('api/membership/404'))
    }
    if (membership.active === false) {
      throw new Error(t('api/membership/cancel/isInactive'))
    }
    if (membership.renew === false) {
      throw new Error(t('api/membership/cancel/notRenewing'))
    }

    const user = await transaction.public.users.findOne({ id: membership.userId })
    Roles.ensureUserIsMeOrInRoles(user, req.user, ['supporter'])

    const membershipType = await transaction.public.membershipTypes.findOne({
      id: membership.membershipTypeId
    })

    if (membershipType.name !== 'MONTHLY_ABO') {
      throw new Error(t('api/membership/cancel/unsupported'))
    }

    if (membershipType.name === 'MONTHLY_ABO' && !membership.subscriptionId) {
      throw new Error(t('api/membership/pleaseWait'))
    }

    let cancelReasons
    if (reason) {
      cancelReasons = membership.cancelReasons || []
      cancelReasons.push(reason)
    }

    const newMembership = await transaction.public.memberships.updateAndGetOne({
      id: membershipId
    }, {
      renew: false,
      active: immediately
        ? false
        : membership.active,
      updatedAt: new Date(),
      ...cancelReasons
        ? { cancelReasons }
        : { }
    })

    if (membership.subscriptionId) {
      await cancelSubscription({
        id: membership.subscriptionId,
        companyId: membershipType.companyId,
        immediately,
        pgdb: transaction
      })
    }

    if (pgdbTransaction) {
      await transaction.transactionCommit()
    }

    await slack.publishMembership(
      user,
      membershipType.name,
      'cancelMembership',
      reason
    )

    return newMembership
  } catch (e) {
    await transaction.transactionRollback()
    console.info('transaction rollback', { req: req._log(), args, error: e })
    throw e
  }
}
