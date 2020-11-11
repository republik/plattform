const getClients = require('./clients')
const { makePledgeSuccessfulWithCharge } = require('../Pledge')

module.exports = async ({ paymentIntentId, companyId }, context) => {
  const { pgdb, t } = context

  const { accountForCompanyId } = await getClients(pgdb)
  const { stripe } = accountForCompanyId(companyId) || {}
  if (!stripe) {
    console.error(`stripe not found for companyId: ${companyId}`)
    throw new Error(t('api/unexpected'))
  }

  let paymentIntent
  try {
    paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
  } catch (e) {
    console.error(e)
  }
  if (!paymentIntent) {
    throw new Error(t(`api/payment/paymentIntent/404`))
  }

  const pledgeId = paymentIntent.metadata?.pledgeId
  if (!pledgeId) {
    // pledgeId is missing in the paymentIntent's metadata if the intent stems
    // from a subscription. These cases are ignored here and only handled by
    // the invoicePaymentSucceeded webhook as we relay on the webhooks event id.
    return {
      pledgeStatus: 'DRAFT',
      updatedPledge: false,
    }
  }

  const charge = paymentIntent.charges?.data[0]
  if (!charge) {
    console.error(`charge not found for paymentIntentId: ${paymentIntentId}`)
    throw new Error(t(`api/unexpected`))
  }

  if (paymentIntent.status === 'succeeded') {
    const { pledge, updatedPledge } = await makePledgeSuccessfulWithCharge(
      {
        pledgeId,
        charge,
      },
      context,
    )
    if (!pledge) {
      throw new Error(t('api/pledge/404'))
    }
    return {
      pledgeStatus: updatedPledge?.status || pledge.status,
      updatedPledge: !!updatedPledge,
    }
  }

  return {
    pledgeStatus: 'DRAFT',
    updatedPledge: false,
  }
}
