import debug from 'debug'
import {
  authorizeAndSettleTransaction,
  getAliasString,
  getTransaction,
  isPreAuthorized,
  settleTransaction,
} from './helpers'
import { GraphqlContext } from '@orbiting/backend-modules-types'

const l = debug('datatrans:lib:payPledge')

type PayPledgeProps = {
  pledgeId: string
  total: number
  sourceId: string
  pspPayload: any
  userId: string
  pkg: {
    companyId: string
  }
  pgdb: GraphqlContext['pgdb']

  // @TODO typescript this nice
  transaction: any
  t: any
  logger: any
}

module.exports = async (props: PayPledgeProps) => {
  const {
    pledgeId,
    total,
    sourceId,
    pspPayload,
    userId,
    pkg,
    transaction,
    t,
    logger = console,
  } = props
  l('%o', { pledgeId, total, sourceId, pspPayload })

  if (!pspPayload) {
    logger.error('pspPayload required', { pledgeId, pspPayload })
    throw new Error(t('api/pay/parseFailed', { id: pledgeId }))
  }

  const { paymentId } = pspPayload

  // check if paymentId is linked to pledgeId
  const pledgePayment = await transaction.public.pledgePayments.findOne({
    pledgeId,
    paymentId,
  })
  if (!pledgePayment) {
    throw Error('...')
  }

  // find payment
  const payment = await transaction.public.payments.findOne({
    id: pledgePayment.paymentId,
  })
  if (payment.status !== 'WAITING') {
    throw new Error('payment not in status WAITING')
  }

  // check status
  let datatransTrx = await getTransaction(payment.pspId)

  if (isPreAuthorized(datatransTrx)) {
    // authorize + settle
    const { transactionId } = await authorizeAndSettleTransaction({
      amount: total,
      refno: payment.hrid,
      alias: datatransTrx,
    })

    datatransTrx = await getTransaction(transactionId)
  } else {
    // settle
    await settleTransaction({
      amount: total,
      datatransTrxId: payment.pspId,
      refno: payment.hrid,
    })
  }

  const transactionStatus = await getTransaction(datatransTrx.transactionId)

  if (transactionStatus.detail?.settle?.amount === undefined) {
    throw new Error(t('api/datatrans/settleAmountError'))
  }

  await transaction.public.payments.updateOne(
    { hrid: datatransTrx.refno },
    {
      total: transactionStatus.detail.settle.amount,
      status: 'PAID',
      pspId: datatransTrx.transactionId,
      pspPayload: transactionStatus,
    },
  )

  const pledgeStatus = 'SUCCESSFUL'

  const aliasString = getAliasString(transactionStatus)
  if (aliasString !== undefined) {
    const hasPaymentSource =
      (await transaction.public.paymentSources.count({
        pspId: aliasString,
        userId,
      })) > 0

    if (!hasPaymentSource) {
      await transaction.public.paymentSources.insert({
        userId,
        method: 'DATATRANS',
        pspId: aliasString,
        pspPayload: transactionStatus,
        companyId: pkg.companyId,
      })
    }
  }

  return pledgeStatus
}
