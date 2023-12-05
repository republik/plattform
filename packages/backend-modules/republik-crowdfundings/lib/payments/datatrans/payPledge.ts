import {
  authorizeAndSettleTransaction,
  getTransaction,
  isPreAuthorized,
  settleTransaction,
} from './helpers'

type PayPledgeProps = {
  pledgeId: string
  total: number
  pspPayload: any
  userId: string

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
    // userId,
    transaction,
    t,
    logger = console,
  } = props

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

  if (await isPreAuthorized(datatransTrx)) {
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

  /*
  if (pspPayload.ALIAS) {
    const paymentSourceExists =
      !!(await transaction.public.paymentSources.findFirst({
        userId,
        pspId: pspPayload.ALIAS,
        method: 'POSTFINANCECARD',
      }))
    if (!paymentSourceExists) {
      // save alias to user
      await transaction.public.paymentSources.insert({
        userId,
        method: 'POSTFINANCECARD',
        pspId: pspPayload.ALIAS,
        pspPayload,
      })
    }
  }
  */

  const pledgeStatus = 'SUCCESSFUL'

  // check if amount is correct
  // PF amount is suddendly in franken
  /*
  if (pspPayload.amount * 100 !== total) {
    logger.info('payed amount doesnt match with pledge total', {
      pledgeId,
      pspPayload,
    })
    pledgeStatus = 'PAID_INVESTIGATE'
  }
  */

  // save alias to user
  /*
  if (pspPayload.ALIAS) {
    await transaction.public.paymentSources.insert({
      userId,
      method: 'POSTFINANCECARD',
      pspId: pspPayload.ALIAS,
    })
  }
  */

  // insert pledgePayment
  await transaction.public.pledgePayments.insert({
    pledgeId,
    paymentId: payment.id,
    paymentType: 'PLEDGE',
  })

  return pledgeStatus
}
