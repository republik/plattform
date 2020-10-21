const {
  forUpdate,
  changeStatus,
  afterChange,
  savePaymentDedup,
} = require('../../Pledge')

module.exports = {
  eventTypes: [
    /*
    'payment_intent.amount_capturable_updated',
    'payment_intent.canceled',
    'payment_intent.created',
    'payment_intent.payment_failed',
    'payment_intent.processing',
    'payment_intent.requires_action',
    */
    'payment_intent.succeeded',
  ],
  handle: async (event, _pgdb, t, _redis, connectionContext) => {
    const context = {
      ...connectionContext,
      t,
    }
    const { pgdb } = context

    const pledgeId = event.data?.object?.metadata?.pledgeId
    if (!pledgeId) {
      // This event only has metadata set if the paymentIntent originates
      // from stripe/payPledge paymentIntents.create.
      // If the paymentIntent was created indirectly e.g. via createSubscription
      // the metadata is not set.
      // In here we are only interested in non subscription PaymentIntents
      // so let's ignore the others

      return 503
    }

    const charge = event?.data?.object?.charges?.data[0]
    if (!charge) {
      console.warn(`${event.type} without charge`)
      return 503
    }

    let updatedPledge
    const result = await forUpdate({
      pledgeId,
      pgdb,
      fn: async ({ pledge, transaction }) => {
        if (!pledge) {
          console.warn(`${event.type} pledge not found for id: ${pledgeId}`)
          return 503
        }

        await savePaymentDedup({
          pledgeId: pledge.id,
          chargeId: charge.id,
          total: charge.amount,
          transaction,
        })

        const newStatus = 'SUCCESSFUL'
        if (pledge.status !== newStatus) {
          updatedPledge = await changeStatus(
            {
              pledge,
              newStatus,
              transaction,
            },
            context,
          )
        }

        return 200
      },
    })

    if (updatedPledge) {
      await afterChange(
        {
          pledge: updatedPledge,
        },
        context,
      )
    }

    return result
  },
}
