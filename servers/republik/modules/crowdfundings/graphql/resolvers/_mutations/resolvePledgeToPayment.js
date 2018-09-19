const { Roles } = require('@orbiting/backend-modules-auth')
const logger = console
const {minTotal, regularTotal} = require('../../../lib/Pledge')
const generateMemberships = require('../../../lib/generateMemberships')
const sendPaymentSuccessful = require('../../../lib/payments/sendPaymentSuccessful')
const { publishMonitor } = require('../../../../../lib/slack')

module.exports = async (_, args, {pgdb, req, t, mail: {enforceSubscriptions}}) => {
  Roles.ensureUserHasRole(req.user, 'supporter')
  const { pledgeId, reason } = args
  const now = new Date()
  const transaction = await pgdb.transactionBegin()
  try {
    const pledge = await transaction.public.pledges.findOne({id: pledgeId})
    if (!pledge) {
      logger.error('pledge not found', { req: req._log(), pledgeId })
      throw new Error(t('api/pledge/404'))
    }
    if (pledge.status !== 'PAID_INVESTIGATE') {
      logger.error('pledge must have status PAID_INVESTIGATE to be eligitable for resolving', { req: req._log(), args, pledge })
      throw new Error(t('api/pledge/resolve/status'))
    }

    // check for payments
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
    if (payments.length > 1) {
      logger.error('pledge has multiple payments, this is not supported', { req: req._log(), args, payments })
      throw new Error(t('api/pledge/resolve/multiplePayments'))
    }
    const payment = payments[0]
    if (payment.status !== 'PAID') {
      logger.error('pledge payment must be PAID', { req: req._log(), args, payment })
      throw new Error(t('api/pledge/resolve/payment/status'))
    }
    const newTotal = payment.total

    // load original of chosen packageOptions
    const pledgeOptions = await transaction.public.pledgeOptions.find({
      pledgeId
    })
    const pledgeOptionsTemplateIds = pledgeOptions.map((plo) => plo.templateId)
    const packageOptions = await transaction.public.packageOptions.find({
      id: pledgeOptionsTemplateIds
    })

    // check total
    const pledgeMinTotal = minTotal(pledgeOptions, packageOptions)
    if (newTotal < pledgeMinTotal) {
      logger.error(`total (${payment.total}) must be >= (${pledgeMinTotal})`, { req: req._log(), args, payment, pledgeMinTotal })
      throw new Error(t('api/pledge/resolve/payment/notEnough', {
        total: newTotal / 100.0,
        minTotal: pledgeMinTotal / 100.0
      }))
    }

    // calculate donation
    const pledgeRegularTotal = regularTotal(pledgeOptions, packageOptions)
    const donation = newTotal - pledgeRegularTotal

    const prefixedReason = 'Support: ' + reason
    await transaction.public.pledges.updateOne({
      id: pledge.id
    }, {
      status: 'SUCCESSFUL',
      total: newTotal,
      donation,
      updatedAt: now,
      reason: pledge.reason
        ? pledge.reason + '\n' + prefixedReason
        : prefixedReason
    })

    if (pledge.total > 100000 && newTotal <= 100000) {
      await generateMemberships(pledge.id, transaction, t, req)
    }

    await sendPaymentSuccessful(pledge.id, transaction, t)

    await transaction.transactionCommit()

    enforceSubscriptions({ pgdb, userId: pledge.userId })

    await publishMonitor(
      req.user,
      `resolvePledgeToPayment pledgeId: ${pledge.id} pledge.total:${pledge.total} newTotal:${newTotal}`
    )
  } catch (e) {
    await transaction.transactionRollback()
    logger.info('transaction rollback', { req: req._log(), args, error: e })
    throw e
  }

  return pgdb.public.pledges.findOne({id: pledgeId})
}
