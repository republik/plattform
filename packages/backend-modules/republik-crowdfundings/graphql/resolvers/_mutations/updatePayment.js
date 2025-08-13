const { Roles } = require('@orbiting/backend-modules-auth')
const generateMemberships = require('../../../lib/generateMemberships')
const { sendPaymentSuccessful } = require('../../../lib/Mail')
const { refreshPotForPledgeId } = require('../../../lib/membershipPot')

module.exports = async (_, args, context) => {
  const { pgdb, t, redis, user: me } = context
  Roles.ensureUserHasRole(me, 'supporter')

  const { paymentId, status, reason } = args
  const now = new Date()

  let updatedPledge
  const transaction = await pgdb.transactionBegin()
  try {
    const payment = await transaction.public.payments.findOne({ id: paymentId })
    if (!payment) {
      context.logger.error({ args }, 'payment not found')
      throw new Error(t('api/payment/404'))
    }

    // check if state transform is allowed
    if (status === 'PAID') {
      if (payment.status !== 'WAITING') {
        context.logger.error(
          { args, payment },
          'only payments with status WAITING can be set to PAID',
        )
        throw new Error(t('api/unexpected'))
      }
      if (!reason) {
        context.logger.error({ args, payment }, 'need reason')
        throw new Error(t('package/customize/userPrice/reason/error'))
      }
    } else if (status === 'REFUNDED') {
      if (payment.status !== 'WAITING_FOR_REFUND') {
        context.logger.error(
          { args, payment },
          'only payments with status WAITING_FOR_REFUND can be REFUNDED',
        )
        throw new Error(t('api/unexpected'))
      }
    } else {
      context.logger.error(
        {
          args,
          payment,
        },
        'only change to PAID and REFUNDED supported.',
      )
      throw new Error(t('api/unexpected'))
    }

    let prefixedReason
    if (reason) {
      prefixedReason = 'Support: ' + reason
    }
    await transaction.public.payments.updateOne(
      {
        id: payment.id,
      },
      {
        status,
        pspPayload: prefixedReason,
        updatedAt: now,
      },
      {
        skipUndefined: true,
      },
    )

    // update pledge status
    if (status === 'PAID') {
      const pledge = (
        await transaction.query(
          `
        SELECT
          p.*
        FROM
          "pledgePayments" pp
        JOIN
          pledges p
          ON pp."pledgeId" = p.id
        WHERE
          pp."paymentId" = :paymentId
      `,
          {
            paymentId,
          },
        )
      )[0]

      if (pledge.status !== 'SUCCESSFUL') {
        updatedPledge = await transaction.public.pledges.updateAndGetOne(
          {
            id: pledge.id,
          },
          {
            status: 'SUCCESSFUL',
            updatedAt: now,
          },
        )
      }

      const hasPledgeMemberships = await pgdb.public.memberships.count({
        pledgeId: pledge.id,
      })

      // Only generate memberships (or periods) of pledge has not generated
      // memberships already.
      if (hasPledgeMemberships < 1) {
        await generateMemberships(pledge.id, transaction, t, redis)
      }

      await sendPaymentSuccessful({ pledgeId: pledge.id, pgdb: transaction, t })
    }

    await transaction.transactionCommit()
  } catch (e) {
    await transaction.transactionRollback()
    context.logger.error({ args, error: e }, 'update payment failed')
    throw e
  }

  if (updatedPledge) {
    await refreshPotForPledgeId(updatedPledge.id, { pgdb }).catch((e) => {
      context.logger.error({ args, error: e }, 'error after payPledge')
    })
  }

  return pgdb.public.payments.findOne({ id: paymentId })
}
