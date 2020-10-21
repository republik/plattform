const getClients = require('../clients')

// fires after createSubscription with CC that requires authentication
// see stripe/payPledge subscribes to redis channel to get the clientSecret
module.exports = {
  eventTypes: ['invoice.payment_action_required'],
  handle: async (event, pgdb, t, redis) => {
    const subscription = event.data?.object?.lines?.data[0]

    if (subscription.type === 'subscription') {
      const pledgeId = subscription.metadata.pledgeId
      const paymentIntentId = event.data?.object?.payment_intent

      // select account and get paymentIntent
      const accountId = event.account
      const { accounts } = await getClients(pgdb)
      const stripe = accounts.find((a) => a.accountId === accountId).stripe

      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId,
      )

      // send clientSecret to stripe/payPledge
      await redis.publish(
        `pledge:${pledgeId}:clientSecret`,
        paymentIntent.client_secret,
      )
    }
  },
}
