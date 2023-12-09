import debug from 'debug'
import {
  authorizeAndSettleTransaction,
  getAliasString,
  getTransaction,
  isPreAuthorized,
  settleTransaction,
} from './helpers'

const l = debug('datatrans:lib:payPledge')

type PayPledgeProps = {
  pledgeId: string
  total: number
  pspPayload: any
  userId: string
  pkg: {
    companyId: string
  }

  // @TODO typescript this nice
  transaction: any
  t: any
  logger: any
}

module.exports = async (props: PayPledgeProps) => {
  const {
    pledgeId,
    total,
    pspPayload,
    userId,
    pkg,
    transaction,
    t,
    logger = console,
  } = props
  l('%o', { pledgeId, total, pspPayload })

  if (!pspPayload) {
    logger.error('pspPayload required', { pledgeId, pspPayload })
    throw new Error(t('api/pay/parseFailed', { id: pledgeId }))
  }

  const { datatransTrxId } = pspPayload

  // check for replay attacks
  if (await transaction.public.payments.findFirst({ pspId: datatransTrxId })) {
    logger.error('this datatransTrxId was used already 😲😒😢', {
      pledgeId,
      pspPayload,
    })
    throw new Error(t('api/pay/paymentIdUsedAlready', { id: pledgeId }))
  }

  let datatransTrx = await getTransaction(datatransTrxId)

  if (isPreAuthorized(datatransTrx)) {
    // authorize + settle
    datatransTrx = await authorizeAndSettleTransaction({
      amount: total,
      refno: pledgeId,
      alias: datatransTrx,
    })
  } else {
    // settle
    await settleTransaction({ datatransTrxId, amount: total, refno: pledgeId })
  }

  const transactionStatus = await getTransaction(datatransTrx.transactionId)

  if (transactionStatus.detail?.settle?.amount === undefined) {
    throw new Error(t('api/datatrans/settleAmountError'))
  }

  const payment = await transaction.public.payments.insertAndGet({
    type: 'PLEDGE',
    method: 'DATATRANS',
    total: transactionStatus.detail.settle.amount,
    status: 'PAID',
    pspId: datatransTrxId,
    pspPayload: transactionStatus,
  })

  const pledgeStatus = 'SUCCESSFUL'

  // insert pledgePayment
  await transaction.public.pledgePayments.insert({
    pledgeId,
    paymentId: payment.id,
    paymentType: 'PLEDGE',
  })

  const aliasString = getAliasString(transactionStatus)
  if (aliasString !== undefined) {
    await transaction.public.paymentSources.insert({
      userId,
      method: 'DATATRANS',
      pspId: aliasString,
      pspPayload: transactionStatus,
      companyId: pkg.companyId,
    })
  }

  return pledgeStatus
}
