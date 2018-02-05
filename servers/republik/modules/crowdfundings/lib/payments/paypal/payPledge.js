const fetch = require('isomorphic-unfetch')
const querystring = require('querystring')

const {
  PAYPAL_USER,
  PAYPAL_PWD,
  PAYPAL_SIGNATURE,
  PAYPAL_URL
} = process.env

module.exports = async ({
  pledgeId,
  total,
  pspPayload,
  transaction,
  t,
  logger = console
}) => {
  if (!pspPayload || !pspPayload.tx) {
    logger.error('pspPayload(.tx) required', { pledgeId, pspPayload })
    throw new Error(t('api/pay/parseFailed', { id: pledgeId }))
  }

  // check for replay attacks
  if (await transaction.public.payments.findFirst({ pspId: pspPayload.tx })) {
    logger.error('this tx was used already 😲😒😢', { pledgeId, pspPayload })
    throw new Error(t('api/pay/paymentIdUsedAlready', { id: pledgeId }))
  }

  // https://developer.paypal.com/docs/classic/api/merchant/GetTransactionDetails_API_Operation_NVP/
  const transactionDetails = {
    'METHOD': 'GetTransactionDetails',
    'TRANSACTIONID': pspPayload.tx,
    'VERSION': '204.0',
    'USER': PAYPAL_USER,
    'PWD': PAYPAL_PWD,
    'SIGNATURE': PAYPAL_SIGNATURE
  }
  const form = querystring.stringify(transactionDetails)
  const contentLength = form.length
  const responseRaw = await fetch(PAYPAL_URL, {
    method: 'POST',
    headers: {
      'Content-Length': contentLength,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: form
  })
  const response = querystring.parse(await responseRaw.text())
  if (response.PAYMENTSTATUS !== 'Completed') {
    logger.error('paypal transaction invalid', { pledgeId, pspPayload, response })
    switch (response.PAYMENTSTATUS) {
      case 'Canceled_Reversal':
      case 'Refunded':
      case 'Reversed':
        throw new Error(t('api/paypal/contactUs'))
      case 'Processed':
      case 'Pending':
        throw new Error(t('api/paypal/delayed'))
      case 'Denied':
      case 'Expired':
      case 'Failed':
      case 'Voided':
        throw new Error(t('api/paypal/deny'))
    }
    throw new Error(t('api/paypal/deny'))
  }

  // get paypal amount (is decimal)
  const amount = parseFloat(response.AMT) * 100

  // save payment
  const payment = await transaction.public.payments.insertAndGet({
    type: 'PLEDGE',
    method: 'PAYPAL',
    total: amount,
    status: 'PAID',
    pspId: pspPayload.tx,
    pspPayload: response
  })

  let pledgeStatus = 'SUCCESSFUL'
  // check if amount is correct
  if (amount !== total) {
    logger.info('payed amount doesnt match with pledge', { pledgeId, pspPayload, payment })
    pledgeStatus = 'PAID_INVESTIGATE'
  }

  // insert pledgePayment
  await transaction.public.pledgePayments.insert({
    pledgeId,
    paymentId: payment.id,
    paymentType: 'PLEDGE'
  })

  return pledgeStatus
}
