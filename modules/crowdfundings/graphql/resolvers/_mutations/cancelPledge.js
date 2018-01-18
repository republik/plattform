const logger = console
const { Roles } = require('@orbiting/backend-modules-auth')
const cancelMembership = require('./cancelMembership')

const moment = require('moment')
const checkEnv = require('check-env')

checkEnv([
  'PARKING_PLEDGE_ID',
  'PARKING_USER_ID'
])

const {
  PARKING_PLEDGE_ID,
  PARKING_USER_ID
} = process.env

module.exports = async (_, args, {pgdb, req, t, mail: { enforceSubscriptions }}) => {
  Roles.ensureUserHasRole(req.user, 'supporter')
  const { pledgeId } = args
  const now = new Date()
  const transaction = await pgdb.transactionBegin()
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

    // MONTHLY can only be cancelled 14 days max after pledge
    const maxDays = 14
    const pkg = await transaction.public.packages.findOne({
      id: pledge.packageId
    })
    if (pkg.name === 'MONTHLY_ABO' && moment().diff(moment(pledge.createdAt), 'days') > maxDays) {
      throw new Error(t('api/pledge/cancel/tooLate', { maxDays }))
    }

    await transaction.public.pledges.updateOne({id: pledgeId}, {
      status: 'CANCELLED',
      updatedAt: now
    })

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

    if (pkg.name === 'MONTHLY_ABO') {
      const memberships = await transaction.public.memberships.find({
        pledgeId
      })
      await cancelMembership(
        null,
        {
          id: memberships[0].id,
          immediately: true
        },
        { pgdb: transaction, req, t }
      )
    }
    await transaction.public.memberships.update({
      pledgeId: pledgeId
    }, {
      pledgeId: PARKING_PLEDGE_ID,
      userId: PARKING_USER_ID,
      updatedAt: now
    })

    await transaction.transactionCommit()

    enforceSubscriptions({ pgdb, userId: pledge.userId })
  } catch (e) {
    await transaction.transactionRollback()
    logger.info('transaction rollback', { req: req._log(), args, error: e })
    throw e
  }

  return pgdb.public.pledges.findOne({id: pledgeId})
}
