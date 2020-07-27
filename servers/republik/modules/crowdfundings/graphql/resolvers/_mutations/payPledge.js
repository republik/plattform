const logger = console
const { sendPledgeConfirmations } = require('../../../lib/Mail')
const generateMemberships = require('../../../lib/generateMemberships')
const { refreshPotForPledgeId } = require('../../../lib/membershipPot')
const payPledgePaymentslip = require('../../../lib/payments/paymentslip/payPledge')
const payPledgePaypal = require('../../../lib/payments/paypal/payPledge')
const payPledgePostfinance = require('../../../lib/payments/postfinance/payPledge')
const payPledgeStripe = require('../../../lib/payments/stripe/payPledge')
const slack = require('../../../../../lib/slack')
const Promise = require('bluebird')

module.exports = async (_, args, context) => {
  const { pgdb, req, t, redis } = context
  const { pledgePayment } = args
  const { pledgeId } = pledgePayment

  let user
  let updatedPledge
  const transaction = await pgdb.transactionBegin()
  try {
    // load pledge
    // FOR UPDATE to wait on other transactions
    const pledge = (await transaction.query(`
      SELECT *
      FROM pledges
      WHERE id = :pledgeId
      FOR UPDATE
    `, {
      pledgeId
    }))[0]
    if (!pledge) {
      logger.error(`pledge (${pledgeId}) not found`, { req: req._log(), args, pledge })
      throw new Error(t('api/unexpected'))
    }
    if (pledge.status === 'SUCCESSFUL') {
      // check if the pledge was paid with the same paypal transaction
      // happens if the webhook is faster than redirect
      const payment = (await transaction.query(`
        SELECT
          pay.*
        FROM
          "pledgePayments" pp
        JOIN
          payments pay
          ON pp."paymentId" = pay.id
        WHERE
          pp."pledgeId" = :pledgeId
      `, {
        pledgeId: pledge.id
      }))[0]
      const { pspPayload } = pledgePayment
      if (
        payment && payment.pspPayload && pspPayload &&
        payment.pspPayload.TRANSACTIONID === pspPayload.tx) {
        await transaction.transactionCommit()
        return {
          pledgeId: pledge.id
        }
      }
      logger.error('pledge is already paid', { req: req._log(), args, pledge, pledgePayment })
      throw new Error(t('api/pledge/alreadyPaid'))
    }

    // load user
    user = await transaction.public.users.findOne({ id: pledge.userId })

    // check if paymentMethod is allowed
    // check by MembershipType would be more precise
    const pkg = await transaction.public.packages.findOne({
      id: pledge.packageId
    })
    if (pkg.paymentMethods.indexOf(pledgePayment.method) === -1) {
      logger.error('payPledge paymentMethod not allowed', { req: req._log(), args, pledge, pledgePayment })
      throw new Error(t('api/pledge/paymentMethod/notAllowed'))
    }

    let pledgeStatus
    // check/charge payment
    if (pledgePayment.method === 'PAYMENTSLIP') {
      pledgeStatus = await payPledgePaymentslip({
        pledgeId: pledge.id,
        total: pledge.total,
        address: pledgePayment.address,
        paperInvoice: pledgePayment.paperInvoice,
        userId: user.id,
        transaction,
        t,
        logger
      })
    } else if (pledgePayment.method === 'STRIPE') {
      pledgeStatus = await payPledgeStripe({
        pledgeId: pledge.id,
        total: pledge.total,
        sourceId: pledgePayment.sourceId,
        pspPayload: pledgePayment.pspPayload,
        userId: user.id,
        pkg,
        transaction,
        pgdb,
        t,
        logger
      })
    } else if (pledgePayment.method === 'POSTFINANCECARD') {
      pledgeStatus = await payPledgePostfinance({
        pledgeId: pledge.id,
        total: pledge.total,
        pspPayload: pledgePayment.pspPayload,
        userId: user.id,
        transaction,
        t,
        logger
      })
    } else if (pledgePayment.method === 'PAYPAL') {
      pledgeStatus = await payPledgePaypal({
        pledgeId: pledge.id,
        total: pledge.total,
        pspPayload: pledgePayment.pspPayload,
        transaction,
        t,
        logger
      })
    } else {
      logger.error('unsupported paymentMethod', { req: req._log(), args, pledge, pledgePayment })
      throw new Error(t('api/unexpected'))
    }
    if (!pledgeStatus) {
      logger.error('pledgeStatus undefined', { req: req._log(), args, pledge, pledgeStatus })
      throw new Error(t('api/unexpected'))
    }

    if (pledge.status !== pledgeStatus) {
      // generate Memberships
      if (pledgeStatus === 'SUCCESSFUL') {
        await generateMemberships(pledge.id, transaction, t, redis)
      }

      // update pledge status
      updatedPledge = await transaction.public.pledges.updateAndGetOne({
        id: pledge.id
      }, {
        status: pledgeStatus,
        sendConfirmMail: true
      })
    }

    // commit transaction
    await transaction.transactionCommit()
  } catch (e) {
    await transaction.transactionRollback()
    logger.info('transaction rollback', { req: req._log(), error: e })
    throw e
  }

  if (updatedPledge) {
    await Promise.all([
      user && user.verified && (
        sendPledgeConfirmations({ userId: user.id, pgdb, t })
      ),
      updatedPledge.status === 'SUCCESSFUL' && (
        refreshPotForPledgeId(pledgeId, context)
      ),
      updatedPledge.status === 'PAID_INVESTIGATE' && (
        slack.publishPledge(
          user,
          updatedPledge,
          'PAID_INVESTIGATE'
        )
      )
    ])
      .catch(e => {
        console.error('error after payPledge', e)
      })
  }

  return {
    pledgeId
  }
}
