const { makePledgeSuccessfulWithCharge } = require('../../Pledge')

const addPaymentMethod = require('../addPaymentMethod')
const {
  maybeUpdateDefault: maybeUpdateDefaultPaymentMethod,
} = require('../paymentMethod')

module.exports = {
  eventTypes: ['payment_intent.succeeded'],
  handle: async (event, pgdb, t, _redis, connectionContext, companyId) => {
    const context = {
      ...connectionContext,
      t,
    }

    const paymentIntent = event.data?.object
    const pledgeId = paymentIntent?.metadata?.pledgeId
    if (!pledgeId) {
      // This event only has metadata set if the paymentIntent originates
      // from stripe/payPledge paymentIntents.create.
      // If the paymentIntent was created indirectly e.g. via createSubscription
      // the metadata is not set.
      // In here we are only interested in non subscription PaymentIntents
      // so let's ignore the others.
      // Removing this shortcut creates an unnecessary race between this and the
      // invoicePaymentSucceeded webhook.
      return 200
    }

    const charge = paymentIntent?.charges?.data[0]
    if (!charge) {
      console.warn(`${event.type} without charge`)
      return 503
    }

    const { pledge } = await makePledgeSuccessfulWithCharge(
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
      console.warn(`${event.type} pledge not found for id: ${pledgeId}`)
      return 503
    }

    await maybeUpdateDefaultPaymentMethod(
      pledge.userId,
      addPaymentMethod,
      pgdb,
    ).catch((e) => console.warn(e))

    return 200
  },
}
