const debug = require('debug')(
  'crowdfundings:lib:payments:stripe:webhooks:paymentIntentSucceeded',
)

const { makePledgeSuccessfulWithCharge } = require('../../Pledge')
const addPaymentMethod = require('../addPaymentMethod')
const {
  maybeUpdateDefault: maybeUpdateDefaultPaymentMethod,
} = require('../paymentMethod')

/**
 * Takes care of a payment intent without an invoice attached
 *
 * Payment intents without invoices are all transactions but subscriptions
 * on Stripe.
 *
 * (Subscriptions are handeled in ./invoicePaymentSucceeded)
 */
module.exports = {
  eventTypes: ['payment_intent.succeeded'],
  handle: async (event, pgdb, t, _redis, connectionContext, companyId) => {
    const context = {
      ...connectionContext,
      t,
    }

    const paymentIntent = event.data?.object

    const invoiceId = paymentIntent?.invoice
    if (invoiceId) {
      // If payment intent is linked to an invoice, ignore this event
      // because ./invoicePaymentSucceeded will take care of it.
      debug('payment intent w/ invoice: ignore event')
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
      console.warn(`${event.type} pledge not found for charge id: ${charge.id}`)
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
