const logger = console
const Promise = require('bluebird')
const { Roles } = require('@orbiting/backend-modules-auth')
const cancelMembership = require('./cancelMembership')

const moment = require('moment')
const { publishMonitor } = require('../../../../../lib/slack')

const { evaluatePledge, updateMembershipPeriods } = require('../../../lib/Pledge/cancel')

const {
  PARKING_PLEDGE_ID,
  PARKING_USER_ID
} = process.env

if (!PARKING_PLEDGE_ID || !PARKING_USER_ID) {
  console.warn('missing env PARKING_PLEDGE_ID and/or PARKING_USER_ID, cancelPledge will not work.')
}

module.exports = async (_, args, context) => {
  const {
    pgdb,
    req,
    t,
    mail: { enforceSubscriptions }
  } = context
  if (!PARKING_PLEDGE_ID || !PARKING_USER_ID) {
    console.error('cancelPledge: missing PARKING_PLEDGE_ID and/or PARKING_USER_ID')
    throw new Error(t('api/unexpected'))
  }

  Roles.ensureUserHasRole(req.user, 'supporter')
  const {
    pledgeId,
    skipEnforceSubscriptions = false,
    transaction: externalTransaction
  } = args
  const now = new Date()
  const transaction = externalTransaction || await pgdb.transactionBegin()
  try {
    const pledge = await transaction.public.pledges.findOne({id: pledgeId})
    if (!pledge) {
      logger.error('pledge not found', { req: req._log(), pledgeId })
      throw new Error(t('api/pledge/404'))
    }
    if (pledge.id === PARKING_PLEDGE_ID || pledge.userId === PARKING_USER_ID) {
      const message = 'pledge PARKING_PLEDGE_ID by PARKING_USER_ID can not be cancelled'
      logger.error(message, { req: req._log(), pledge })
      throw new Error(message)
    }
    const pkg = await transaction.public.packages.findOne({
      id: pledge.packageId
    })

    if (pledge.status === 'DRAFT') {
      await transaction.public.pledges.deleteOne({
        id: pledgeId
      })
    } else {
      // MONTHLY can only be cancelled 14 days max after pledge
      const maxDays = 14
      if (pkg.name === 'MONTHLY_ABO' && moment().diff(moment(pledge.createdAt), 'days') > maxDays) {
        throw new Error(t('api/pledge/cancel/tooLate', { maxDays }))
      }

      await transaction.public.pledges.updateOne({id: pledgeId}, {
        status: 'CANCELLED',
        updatedAt: now
      })
    }

    const payments = await transaction.query(`
      SELECT
        pay.*
      FROM
        payments pay
      JOIN
        "pledgePayments" pp
        ON pp."paymentId" = pay.id
      JOIN
        pledges p
        ON pp."pledgeId" = p.id
      WHERE
        p.id = :pledgeId
    `, {
      pledgeId
    })

    for (let payment of payments) {
      let newStatus
      switch (payment.status) {
        case 'WAITING':
          newStatus = 'CANCELLED'
          break
        case 'PAID':
          newStatus = 'WAITING_FOR_REFUND'
          break
        default:
          newStatus = payment.status
      }
      if (newStatus !== payment.status) {
        await transaction.public.payments.updateOne({
          id: payment.id
        }, {
          status: newStatus,
          updatedAt: now
        })
      }
    }

    const cancelImmediately = pkg.name === 'MONTHLY_ABO'

    const evaluatePledges = await evaluatePledge({ pledgeId }, { pgdb: transaction, now })

    await Promise.map(
      evaluatePledges,
      async ({ _raw: { id }, periods: evaluatedPeriods }) => {
        await updateMembershipPeriods({ evaluatedPeriods }, { pgdb: transaction })

        // determine endDate
        const inPast = !!(await transaction.queryOneField(`
          SELECT MAX("endDate") <= :now
          FROM "membershipPeriods"
          WHERE "membershipId" = :membershipId
        `, { membershipId: id, now }))

        // Check if memebership should be cancelled when latest end date is now in past
        if (inPast) {
          await cancelMembership(
            null,
            {
              id,
              immediately: cancelImmediately,
              details: {
                type: 'SYSTEM',
                reason: 'Auto Cancellation (cancelPledge)',
                suppressConfirmation: true,
                suppressWinback: true
              }
            },
            { ...context, pgdb: transaction }
          )
        }
      }
    )

    if (!externalTransaction) {
      await transaction.transactionCommit()
    }

    if (!skipEnforceSubscriptions) {
      await enforceSubscriptions({ pgdb, userId: pledge.userId })
    }

    await publishMonitor(
      req.user,
      `cancelPledge pledgeId: ${pledge.id} pkgName: ${pkg.name}`
    )
  } catch (e) {
    await transaction.transactionRollback()
    logger.info('transaction rollback', { req: req._log(), args, error: e })
    throw e
  }

  return pgdb.public.pledges.findOne({id: pledgeId})
}
