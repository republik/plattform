const crypto = require('crypto')
const { ascending } = require('d3-array')

module.exports = async ({
  pledgeId,
  total,
  pspPayloadRaw,
  userId,
  transaction,
  t,
  logger = console
}) => {
  let pspPayload = null
  try {
    pspPayload = JSON.parse(pspPayloadRaw)
  } catch (e) {
    logger.error('failed to parse pspPayload', { pledgeId, pspPayloadRaw })
    throw new Error(t('api/pay/parseFailed', { id: pledgeId }))
  }
  if (!pspPayload) {
    logger.error('pspPayload required', { pledgeId, pspPayloadRaw })
    throw new Error(t('api/pay/parseFailed', { id: pledgeId }))
  }

  // check SHA of postfinance
  const { SHASIGN, STATUS, PAYID } = pspPayload
  delete pspPayload.SHASIGN
  const secret = process.env.PF_SHA_OUT_SECRET
  // sort params based on upper case order (urgh!)
  const paramsString = Object.keys(pspPayload)
    .sort((a, b) => ascending(a.toUpperCase(), b.toUpperCase()))
    .filter(key => pspPayload[key])
    .map(key => `${key.toUpperCase()}=${pspPayload[key]}${secret}`)
    .join('')
  const shasum = crypto.createHash('sha1').update(paramsString).digest('hex').toUpperCase()
  if (SHASIGN !== shasum) {
    logger.error('SHASIGN not correct', { pledgeId, shasum, SHASIGN, pspPayload })
    throw new Error(t('api/pay/pf/error', { id: pledgeId }))
  }

  // https://e-payment-postfinance.v-psp.com/de/guides/user%20guides/statuses-and-errors
  const status = parseInt(STATUS)
  if (status !== 9 && status !== 91) {
    logger.error('STATUS not successfull', { pledgeId, shasum, SHASIGN, status, pspPayload })
    throw new Error(t('api/pay/pf/error', { id: pledgeId }))
  }

  // check for replay attacks
  if (await transaction.public.payments.findFirst({ pspId: PAYID })) {
    logger.error('this PAYID was used already 😲😒😢', { pledgeId, pspPayload })
    throw new Error(t('api/pay/paymentIdUsedAlready', { id: pledgeId }))
  }

  // save payment
  // PF amount is suddendly in franken
  const payment = await transaction.public.payments.insertAndGet({
    type: 'PLEDGE',
    method: 'POSTFINANCECARD',
    total: pspPayload.amount * 100,
    status: 'PAID',
    pspId: PAYID,
    pspPayload
  })

  if (pspPayload.ALIAS) {
    const paymentSourceExists = !!(await transaction.public.paymentSources.findFirst({
      userId,
      pspId: pspPayload.ALIAS,
      method: 'POSTFINANCECARD'
    }))
    if (!paymentSourceExists) {
      // save alias to user
      await transaction.public.paymentSources.insert({
        userId,
        method: 'POSTFINANCECARD',
        pspId: pspPayload.ALIAS,
        pspPayload
      })
    }
  }

  let pledgeStatus = 'SUCCESSFUL'

  // check if amount is correct
  // PF amount is suddendly in franken
  if (pspPayload.amount * 100 !== total) {
    logger.info('payed amount doesnt match with pledge total', { pledgeId, pspPayload })
    pledgeStatus = 'PAID_INVESTIGATE'
  }

  // save alias to user
  if (pspPayload.ALIAS) {
    await transaction.public.paymentSources.insert({
      userId,
      method: 'POSTFINANCECARD',
      pspId: pspPayload.ALIAS
    })
  }

  // insert pledgePayment
  await transaction.public.pledgePayments.insert({
    pledgeId,
    paymentId: payment.id,
    paymentType: 'PLEDGE'
  })

  return pledgeStatus
}
