const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const syncPaymentIntent = require('../../../lib/payments/stripe/syncPaymentIntent')

module.exports = async (_, args, context) => {
  const { req } = context
  ensureSignedIn(req)

  return syncPaymentIntent(
    {
      ...args,
      paymentIntentId: args.stripePaymentIntentId,
    },
    context,
  )
}
