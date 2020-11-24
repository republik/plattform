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

  const charge = paymentIntent.charges?.data[0]
  if (!charge) {
    console.error(`charge not found for paymentIntentId: ${paymentIntentId}. Did you call confirmCardPayment?`)
  }

  if (charge && paymentIntent.status === 'succeeded') {
    const { pledge, updatedPledge } = await makePledgeSuccessfulWithCharge(
      {
        charge,
        companyId,
      },
      context,
    ).catch((e) => {
      console.warn(e)
      return {}
    })
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
