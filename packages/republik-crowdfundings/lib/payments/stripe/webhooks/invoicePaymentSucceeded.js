const debug = require('debug')(
  'crowdfundings:lib:payments:stripe:webhooks:invoicePaymentSucceeded',
)

const { makePledgeSuccessfulWithCharge } = require('../../Pledge')

const addPaymentMethod = require('../addPaymentMethod')
const {
  maybeUpdateDefault: maybeUpdateDefaultPaymentMethod,
} = require('../paymentMethod')

// used by stripe subscriptions (source or paymentMethod)
// paymentIntent for one time payments don't create an invoice
// so this is only used for subscriptions
//
// invoice.payment_succeeded includes:
// pledgeId, charge total and charge id
// but not the charge details

/**
 * Takes care of an invoice payment
 *
 * Invoice payments are linked only to subscriptions handled on Stripe.
 *
 * (Other transactions are handeled in ./paymentIntentSucceeded)
 */
module.exports = {
  eventTypes: ['invoice.payment_succeeded'],
  handle: async (event, pgdb, t, _redis, connectionContext, companyId) => {
    const context = {
      ...connectionContext,
      t,
    }

    const invoice = event.data?.object

    debug('invoice %o', invoice)

    const chargeId = invoice?.charge
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
      console.warn(`${event.type} pledge not found for charge id: ${chargeId}`)
      return 503
    }

    if (invoice?.billing_reason === 'subscription_create') {
      await maybeUpdateDefaultPaymentMethod(
        pledge.userId,
        addPaymentMethod,
        pgdb,
      ).catch((e) => console.warn(e))
    }

    return 200
  },
}
