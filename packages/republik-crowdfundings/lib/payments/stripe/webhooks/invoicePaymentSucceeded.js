const { makePledgeSuccessfulWithCharge } = require('../../Pledge')

// used by stripe subscriptions (source or paymentMethod)
// paymentIntent for one time payments don't create an invoice
// so this is only used for subscriptions
//
// invoice.payment_succeeded includes:
// pledgeId, charge total and charge id
// but not the charge details
module.exports = {
  eventTypes: ['invoice.payment_succeeded'],
  handle: async (event, pgdb, t, redis, connectionContext, companyId) => {
    const context = {
      ...connectionContext,
      t,
    }

    const chargeId = event.data?.object?.charge
    if (!chargeId) {
      console.error('chargeId not found for invoice.payment_succeeded')
      return 503
    }

    const { pledge } = await makePledgeSuccessfulWithCharge(
      {
        chargeId,
        companyId,
      },
      context,
    ).catch((e) => {
      console.warn(e)
      return {}
    })

    if (!pledge) {
      return 503
    }

    return 200
  },
}
