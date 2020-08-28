const { Roles, transformUser } = require('@orbiting/backend-modules-auth')
const cancelMembership = require('../../../lib/cancelMembership')
const createCache = require('../../../lib/cache')
const slack = require('@orbiting/backend-modules-republik/lib/slack')
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

    const user = await transaction.public.users.findOne({ id: membership.userId }).then(transformUser)
    Roles.ensureUserIsMeOrInRoles(user, req.user, ['supporter'])

    if (membership.active === false) {
      throw new Error(t('api/membership/cancel/isInactive'))
    }
    if (membership.renew === false) {
      throw new Error(t('api/membership/cancel/notRenewing'))
    }

    membership.membershipType = await pgdb.public.membershipTypes.findOne({
      id: membership.membershipTypeId
    })

    const cancelledViaSupport = user.id !== req.user.id || details.cancelledViaSupport

    const cancelledMembership = await cancelMembership(
      membership,
      { ...details, cancelledViaSupport },
      { immediately },
      t,
      transaction
    )

    if (!pgdb.isTransactionActive()) {
      await transaction.transactionCommit()
    }

    // determine endDate
    const endDate = await pgdb.queryOneField(`
      SELECT MAX("endDate")
      FROM "membershipPeriods"
      WHERE "membershipId" = :membershipId
    `, {
      membershipId
    })

    if (!details.suppressConfirmation) {
      await mail.sendMembershipCancellation({
        email: user.email,
        name: user.name,
        endDate,
        membershipType: membership.membershipType,
        reasonGiven: details.reason && details.reason.length > 1,
        t,
        pgdb
      })
    }

    await slack.publishMembership(
      user,
      membership.membershipType.name,
      'cancelMembership',
      {
        ...details,
        category: getLabel(details, {}, context)
      },
      t
    )

    const cache = createCache({ prefix: `User:${user.id}` }, context)
    cache.invalidate()

    return cancelledMembership
  } catch (e) {
    if (!pgdb.isTransactionActive()) {
      await transaction.transactionRollback()
      console.info('transaction rollback', { req: req._log(), args, error: e })
    }

    throw e
  }
}
