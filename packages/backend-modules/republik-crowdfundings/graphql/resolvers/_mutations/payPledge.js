const {
  upsertAddress,
} = require('@orbiting/backend-modules-republik/lib/address')

const payPledgePaymentslip = require('../../../lib/payments/paymentslip/payPledge')
const payPledgePaypal = require('../../../lib/payments/paypal/payPledge')
const payPledgePostfinance = require('../../../lib/payments/postfinance/payPledge')
const payPledgeStripe = require('../../../lib/payments/stripe/payPledge')
const payPledgeDatatrans = require('@orbiting/backend-modules-datatrans/lib/payPledge')

const {
  forUpdate,
  changeStatus,
  afterChange,
} = require('../../../lib/payments/Pledge')
const {
  DatatransPaymentMethods,
} = require('@orbiting/backend-modules-datatrans/lib/types')

const logger = console

module.exports = async (_, args, context) => {
  const { pgdb, req, t } = context
  const { pledgePayment } = args
  const { pledgeId } = pledgePayment

  const { updatedPledge, pledgeResponse } = await forUpdate({
    pledgeId,
    pgdb,
    fn: async ({ pledge, transaction }) => {
      if (!pledge) {
        logger.error(`pledge (${pledgeId}) not found`, {
          req: req._log(),
          args,
          pledge,
        })
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
        logger.error('pledge is already paid', {
          req: req._log(),
          args,
          pledge,
          pledgePayment,
        })
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
        logger.error('payPledge paymentMethod not allowed', {
          req: req._log(),
          args,
          pledge,
          pledgePayment,
        })
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
      } else if (DatatransPaymentMethods.includes(pledgePayment.method)) {
        // @TODO too many props, check again
        pledgeStatus = await payPledgeDatatrans({
          pledgeId: pledge.id,
          total: pledge.total,
          sourceId: pledgePayment.sourceId,
          pspPayload: pledgePayment.pspPayload,
          makeDefault: pledgePayment.makeDefault,
          userId: user.id,
          pkg,
          transaction,
          pgdb,
          t,
          logger,
        })
      } else {
        logger.error('unsupported paymentMethod', {
          req: req._log(),
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
        logger.error('pledgeStatus undefined', {
          req: req._log(),
          args,
          pledge,
          pledgeStatus,
        })
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
