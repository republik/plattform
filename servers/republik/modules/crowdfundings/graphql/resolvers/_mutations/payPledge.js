const logger = console
const sendPendingPledgeConfirmations = require('../../../lib/sendPendingPledgeConfirmations')
const generateMemberships = require('../../../lib/generateMemberships')
const payPledgePaymentslip = require('../../../lib/payments/paymentslip/payPledge')
const payPledgePaypal = require('../../../lib/payments/paypal/payPledge')
const payPledgePostfinance = require('../../../lib/payments/postfinance/payPledge')
const payPledgeStripe = require('../../../lib/payments/stripe/payPledge')
const slack = require('../../../../../lib/slack')

module.exports = async (_, args, {pgdb, req, t}) => {
  const transaction = await pgdb.transactionBegin()
  try {
    const { pledgePayment } = args

    // load pledge
    // FOR UPDATE to wait on other transactions
    const pledge = (await transaction.query(`
      SELECT *
      FROM pledges
      WHERE id = :pledgeId
      FOR UPDATE
    `, {
      pledgeId: pledgePayment.pledgeId
    }))[0]
    if (!pledge) {
      logger.error(`pledge (${pledgePayment.pledgeId}) not found`, { req: req._log(), args, pledge })
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
    const user = await transaction.public.users.findOne({id: pledge.userId})

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
        await generateMemberships(pledge.id, transaction, t, req, logger)
      }

      // update pledge status
      await transaction.public.pledges.updateOne({
        id: pledge.id
      }, {
        status: pledgeStatus
      })

      if (pledgeStatus === 'PAID_INVESTIGATE') {
        await slack.publishPledge(
          user,
          pledge,
          'PAID_INVESTIGATE'
        )
      }
    }

    // send a confirmation email for this pledge
    await transaction.public.pledges.updateOne({
      id: pledge.id
    }, {
      sendConfirmMail: true
    })

    // commit transaction
    await transaction.transactionCommit()

    if (req.user) {
      try {
        // if the user is signed in, send mail immediately
        await sendPendingPledgeConfirmations(pledge.userId, pgdb, t)
      } catch (e) {
        console.warn('error in payPledge after transactionCommit', e)
      }
    }

    return {
      pledgeId: pledge.id
    }
  } catch (e) {
    await transaction.transactionRollback()
    logger.info('transaction rollback', { req: req._log(), error: e })
    throw e
  }
}
