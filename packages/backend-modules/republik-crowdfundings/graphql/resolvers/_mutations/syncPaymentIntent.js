const syncPaymentIntent = require('../../../lib/payments/stripe/syncPaymentIntent')

module.exports = async (_, args, context) =>
  syncPaymentIntent(
    {
      ...args,
      paymentIntentId: args.stripePaymentIntentId,
    },
    context,
  )
