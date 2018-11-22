const { Roles, transformUser } = require('@orbiting/backend-modules-auth')
const cancelSubscription = require('../../../lib/payments/stripe/cancelSubscription')
const slack = require('../../../../../lib/slack')
const { timeFormat } = require('@orbiting/backend-modules-formats')
const dateFormat = timeFormat('%x')

module.exports = async (_, args, context) => {
  const {
    pgdb,
    req,
    t,
    mail: {
      sendMailTemplate
    }
  } = context
  const transaction = pgdb.isTransactionActive()
    ? await pgdb
    : await pgdb.transactionBegin()

  try {
    const {
      id: membershipId,
      immediately = false,
      details,
      suppressNotification
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
      WHERE "membershipId" = :membershipId`
      , {
      membershipId
    })

    await transaction.public.membershipCancellations.insert({
      membershipId: newMembership.id,
      reason: details.reason,
      category: details.type
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

    if (!suppressNotification) {
      await sendMailTemplate({
        to: user.email,
        subject: t('api/membership/cancel/mail/subject'),
        templateName: 'membership_cancel_notice',
        mergeLanguage: 'handlebars',
        globalMergeVars: [
          { name: 'name',
            content: user.name
          },
          { name: 'end_date',
            content: dateFormat(endDate)
          }
        ]
      })
    }

    await slack.publishMembership(
      user,
      membershipType.name,
      'cancelMembership',
      details
    )

    return newMembership
  } catch (e) {
    if (!pgdb.isTransactionActive()) {
      await transaction.transactionRollback()
      console.info('transaction rollback', { req: req._log(), args, error: e })
    }

    throw e
  }
}
