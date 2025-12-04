const { Roles } = require('@orbiting/backend-modules-auth')
const { minTotal, regularTotal } = require('../../../lib/Pledge')
const generateMemberships = require('../../../lib/generateMemberships')
const { sendPaymentSuccessful } = require('../../../lib/Mail')
const {
  publishMonitor,
} = require('@orbiting/backend-modules-republik/lib/slack')
const { refreshPotForPledgeId } = require('../../../lib/membershipPot')
const Promise = require('bluebird')

module.exports = async (_, args, context) => {
  const {
    pgdb,
    req,
    t,
    mail: { enforceSubscriptions },
    redis,
  } = context

  Roles.ensureUserHasRole(req.user, 'supporter')

  const { pledgeId, reason } = args
  const now = new Date()

  let pledge
  let updatedPledge
  const transaction = await pgdb.transactionBegin()
  try {
    pledge = await transaction.public.pledges.findOne({ id: pledgeId })
    if (!pledge) {
      context.logger.error({ pledgeId }, 'pledge not found')
      throw new Error(t('api/pledge/404'))
    }
    if (pledge.status !== 'PAID_INVESTIGATE') {
      context.logger.error(
        { args, pledge },
        'pledge must have status PAID_INVESTIGATE to be eligitable for resolving',
      )
      throw new Error(t('api/pledge/resolve/status'))
    }

    // check for payments
    const payments = await transaction.query(
      `
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
    `,
      {
        pledgeId,
      },
    )
    if (payments.length > 1) {
      context.logger.error(
        {
          args,
          payments,
        },
        'pledge has multiple payments, this is not supported',
      )
      throw new Error(t('api/pledge/resolve/multiplePayments'))
    }
    const payment = payments[0]
    if (payment.status !== 'PAID') {
      context.logger.error(
        {
          args,
          payment,
        },
        'pledge payment must be PAID',
      )
      throw new Error(t('api/pledge/resolve/payment/status'))
    }
    const newTotal = payment.total

    // load original of chosen packageOptions
    const pledgeOptions = await transaction.public.pledgeOptions.find({
      pledgeId,
    })
    const pledgeOptionsTemplateIds = pledgeOptions.map((plo) => plo.templateId)
    const packageOptions = await transaction.public.packageOptions.find({
      id: pledgeOptionsTemplateIds,
    })

    /**
     * Check if new total is lower than expected minimum total
     *
     * Due to currency exchange rates, new total can not be lower than
     * 90 percent of minimum.
     */
    const expectedMinTotal = minTotal(pledgeOptions, packageOptions) * 0.9
    if (newTotal < expectedMinTotal) {
      context.logger.error(
        {
          args,
          payment,
          total: payment.total,
          expectedMinTotal,
        },
        `total must be >= expectedMinTotal`,
      )
      throw new Error(
        t('api/pledge/resolve/payment/notEnough', {
          total: newTotal / 100.0,
          minTotal: expectedMinTotal / 100.0,
        }),
      )
    }

    // calculate donation
    const pledgeRegularTotal = regularTotal(pledgeOptions, packageOptions)
    const donation = newTotal - pledgeRegularTotal

    const prefixedReason = 'Support: ' + reason
    updatedPledge = await transaction.public.pledges.updateAndGetOne(
      {
        id: pledge.id,
      },
      {
        status: 'SUCCESSFUL',
        total: newTotal,
        donation,
        updatedAt: now,
        reason: pledge.reason
          ? pledge.reason + '\n' + prefixedReason
          : prefixedReason,
      },
    )

    const hasPledgeMemberships = await pgdb.public.memberships.count({
      pledgeId: pledge.id,
    })

    // Only generate memberships (or periods) of pledge has not generated
    // memberships already.
    if (hasPledgeMemberships < 1) {
      await generateMemberships(pledge.id, transaction, t, redis)
    }

    await sendPaymentSuccessful({ pledgeId: pledge.id, pgdb: transaction, t })

    await transaction.transactionCommit()
  } catch (e) {
    await transaction.transactionRollback()
    context.logger.error({ args, error: e }, 'resolve payment to pledge failed')
    throw e
  }

  if (updatedPledge) {
    await Promise.all([
      enforceSubscriptions({ pgdb, userId: updatedPledge.userId }),
      refreshPotForPledgeId(updatedPledge.id, { pgdb }),
      publishMonitor(
        req.user,
        `resolvePledgeToPayment pledgeId: ${pledge.id} pledge.total:${
          pledge.total / 100
        } newTotal:${updatedPledge.total / 100}`,
      ),
    ]).catch((e) => {
      context.logger.error({ error: e }, 'error after payPledge')
    })
  }

  return pgdb.public.pledges.findOne({ id: pledgeId })
}
