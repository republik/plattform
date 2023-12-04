const { ascending } = require('d3-array')

type PayPledgeProps = {
  pledgeId: string,
  total: number,
  pspPayload: any,
  userId: string,

  // @TODO typescript this nice
  transaction: any,
  t: any,
  logger: any,
}

module.exports = async (props: PayPledgeProps) => {
  const {
    pledgeId,
    // total,
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
    logger.error('this datatransTrxId was used already 😲😒😢', { pledgeId, pspPayload })
    throw new Error(t('api/pay/paymentIdUsedAlready', { id: pledgeId }))
  }

  const transactionRes = await fetch(
    `https://api.sandbox.datatrans.com/v1/transactions/${datatransTrxId}`,
    {
      headers: {
        Authorization:
          "Basic " +
          Buffer
            .from(process.env.DATATRANS_MERCHANT_ID + ":" + process.env.DATATRANS_MERCHANT_PASSWORD)
            .toString('base64'),
        "Content-Type": "application/json",
      },
    }
  );

  if (!transactionRes.ok) {
    throw new Error(
      "Error" +
        JSON.stringify({
          status: transactionRes.status,
          statusText: await transactionRes.text(),
        })
    );
  }
  
  const transactionStatus = await transactionRes.json()

  if (transactionStatus.status !== 'settled') {
    throw new Error(t('api/datatrans/statusError'))
  }

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

  let pledgeStatus = 'SUCCESSFUL'

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
