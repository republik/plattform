const {
  upsertAddress,
} = require('@orbiting/backend-modules-republik/lib/address')

const payPledgePaymentslip = require('../../../lib/payments/paymentslip/payPledge')
const payPledgePaypal = require('../../../lib/payments/paypal/payPledge')
const payPledgePostfinance = require('../../../lib/payments/postfinance/payPledge')
const payPledgeStripe = require('../../../lib/payments/stripe/payPledge')
const {
  forUpdate,
  changeStatus,
  afterChange,
} = require('../../../lib/payments/Pledge')

const logger = console

module.exports = async (_, args, context) => {
  const { pgdb, t } = context
  const { pledgePayment } = args
  const { pledgeId } = pledgePayment

  const { updatedPledge, pledgeResponse } = await forUpdate({
    pledgeId,
    pgdb,
    fn: async ({ pledge, transaction }) => {
      if (!pledge) {
        context.logger.error(
          {
            args,
            pledgeId,
            pledge,
          },
          `pledge not found`,
        )
        throw new Error(t('api/unexpected'))
      }

      if (pledge.status === 'SUCCESSFUL') {
        // check if the pledge was paid with the same paypal transaction
        // happens if the webhook is faster than redirect
        const payment = (
          await transaction.query(
            `
          SELECT
            pay.*
          FROM
            "pledgePayments" pp
          JOIN
            payments pay
            ON pp."paymentId" = pay.id
          WHERE
            pp."pledgeId" = :pledgeId
        `,
            {
              pledgeId: pledge.id,
            },
          )
        )[0]
        const { pspPayload } = pledgePayment
        if (
          payment &&
          payment.pspPayload &&
          pspPayload &&
          payment.pspPayload.TRANSACTIONID === pspPayload.tx
        ) {
          return {}
        }
        context.logger.error(
          {
            args,
            pledge,
            pledgePayment,
          },
          'pledge is already paid',
        )
        throw new Error(t('api/pledge/alreadyPaid'))
      }

      // load user
      const user = await transaction.public.users.findOne({ id: pledge.userId })

      // check if paymentMethod is allowed
      // check by MembershipType would be more precise
      const pkg = await transaction.public.packages.findOne({
        id: pledge.packageId,
      })
      if (pkg.paymentMethods.indexOf(pledgePayment.method) === -1) {
        context.logger.error(
          {
            args,
            pledge,
            pledgePayment,
          },
          'payPledge paymentMethod not allowed',
        )
        throw new Error(t('api/pledge/paymentMethod/notAllowed'))
      }

      let pledgeStatus
      let pledgeResponse
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
          logger,
        })
      } else if (pledgePayment.method === 'STRIPE') {
        pledgeResponse = await payPledgeStripe({
          pledgeId: pledge.id,
          total: pledge.total,
          sourceId: pledgePayment.sourceId,
          pspPayload: pledgePayment.pspPayload,
          makeDefault: pledgePayment.makeDefault,
          promoCode: pledge?.payload?.coupon,
          userId: user.id,
          pkg,
          transaction,
          pgdb,
          t,
          logger,
        })
      } else if (pledgePayment.method === 'POSTFINANCECARD') {
        pledgeStatus = await payPledgePostfinance({
          pledgeId: pledge.id,
          total: pledge.total,
          pspPayload: pledgePayment.pspPayload,
          userId: user.id,
          transaction,
          t,
          logger,
        })
      } else if (pledgePayment.method === 'PAYPAL') {
        pledgeStatus = await payPledgePaypal({
          pledgeId: pledge.id,
          total: pledge.total,
          pspPayload: pledgePayment.pspPayload,
          transaction,
          t,
          logger,
        })
      } else {
        context.logger.error('unsupported paymentMethod', {
          args,
          pledge,
          pledgePayment,
        })
        throw new Error(t('api/unexpected'))
      }

      if (pledgeResponse) {
        pledgeStatus = pledgeResponse.status
      }

      if (!pledgeStatus) {
        context.logger.error(
          {
            args,
            pledge,
            pledgeStatus,
          },
          'pledgeStatus undefined',
        )
        throw new Error(t('api/unexpected'))
      }

      let updatedPledge
      if (pledge.status !== pledgeStatus) {
        updatedPledge = await changeStatus(
          {
            pledge,
            newStatus: pledgeStatus,
            transaction,
          },
          context,
        )
      }

      const address =
        pledgePayment.address &&
        (await upsertAddress(
          { ...pledgePayment.address, id: user.addressId },
          transaction,
          t,
        ))

      if (address) {
        await transaction.public.users.update(
          { id: user.id },
          { addressId: address.id },
        )
      }

      return {
        updatedPledge,
        pledgeResponse,
      }
    },
  })

  if (updatedPledge) {
    await afterChange(
      {
        pledge: updatedPledge,
      },
      context,
    )
  }

  return {
    pledgeId,
    ...pledgeResponse,
  }
}
