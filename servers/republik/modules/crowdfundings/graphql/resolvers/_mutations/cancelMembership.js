const { Roles, transformUser } = require('@orbiting/backend-modules-auth')
const cancelSubscription = require('../../../lib/payments/stripe/cancelSubscription')
const createCache = require('../../../lib/cache')
const slack = require('../../../../../lib/slack')
const { label: getLabel } = require('../CancellationCategory')

module.exports = async (_, args, context) => {
  const {
    pgdb,
    req,
    t,
    mail
  } = context
  const transaction = pgdb.isTransactionActive()
    ? await pgdb
    : await pgdb.transactionBegin()

  try {
    const {
      id: membershipId,
      immediately = false,
      details
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

    const user = transformUser(
      await transaction.public.users.findOne({ id: membership.userId })
    )
    Roles.ensureUserIsMeOrInRoles(user, req.user, ['supporter'])

    const membershipType = await transaction.public.membershipTypes.findOne({
      id: membership.membershipTypeId
    })

    if (membershipType.name === 'MONTHLY_ABO' && !membership.subscriptionId) {
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
    // determine endDate
    const endDate = await pgdb.queryOneField(`
      SELECT MAX("endDate")
      FROM "membershipPeriods"
      WHERE "membershipId" = :membershipId
    `, {
      membershipId
    })

    await transaction.public.membershipCancellations.insert({
      membershipId: newMembership.id,
      reason: details.reason,
      category: details.type,
      suppressConfirmation: !!details.suppressConfirmation,
      suppressWinback: !!details.suppressWinback,
      cancelledViaSupport: user.id !== req.user.id
    })

    if (membership.subscriptionId) {
      await cancelSubscription({
        id: membership.subscriptionId,
        companyId: membershipType.companyId,
        immediately,
        pgdb: transaction
      })
    }

    if (!pgdb.isTransactionActive()) {
      await transaction.transactionCommit()
    }

    if (!details.suppressConfirmation) {
      await mail.sendMembershipCancellation({
        email: user.email,
        name: user.name,
        endDate,
        membershipType,
        reasonGiven: details.reason && details.reason.length > 1,
        t,
        pgdb
      })
    }

    await slack.publishMembership(
      user,
      membershipType.name,
      'cancelMembership',
      {
        ...details,
        category: getLabel(details, {}, context)
      },
      t
    )

    const cache = createCache({ prefix: `User:${user.id}` }, context)
    cache.invalidate()

    return newMembership
  } catch (e) {
    if (!pgdb.isTransactionActive()) {
      await transaction.transactionRollback()
      console.info('transaction rollback', { req: req._log(), args, error: e })
    }

    throw e
  }
}
