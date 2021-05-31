const { makePledgeSuccessfulWithCharge } = require('../Pledge')

const getClients = require('./clients')
const addPaymentMethod = require('./addPaymentMethod')
const {
  maybeUpdateDefault: maybeUpdateDefaultPaymentMethod,
} = require('./paymentMethod')

module.exports = async ({ paymentIntentId, companyId }, context) => {
  const { pgdb, t } = context

  const clients = await getClients(pgdb)
  const { stripe } = clients.accountForCompanyId(companyId) || {}
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
    console.error(
      `charge not found for paymentIntentId: ${paymentIntentId}. Did you call confirmCardPayment?`,
    )
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

    await maybeUpdateDefaultPaymentMethod(
      updatedPledge?.userId || pledge.userId,
      addPaymentMethod,
      pgdb,
    ).catch((e) => console.warn(e))

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
