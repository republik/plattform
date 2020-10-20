const {
  forUpdate,
  changeStatus,
  afterChange,
  savePaymentDedup,
} = require('../../Pledge')

module.exports = {
  eventTypes: [
    'payment_intent.amount_capturable_updated',
    'payment_intent.canceled',
    'payment_intent.created',
    'payment_intent.payment_failed',
    'payment_intent.processing',
    'payment_intent.requires_action',
    'payment_intent.succeeded',
  ],
  handle: async (event, _pgdb, t, _redis, connectionContext) => {
    const context = {
      ...connectionContext,
      t,
    }
    const { pgdb } = context

    const eventType = event?.type
    const pledgeId = event?.data?.object?.metadata?.pledgeId

    if (!pledgeId) {
      console.warn('received PaymentIntent webhook without pledgeId')
      return 503
    }

    /*
    const getClients = require('../clients')
    const accountId = event?.account
    const paymentIntentId = event?.data?.object?.id
    const paymentIntent = event?.data?.object
    const { accounts } = await getClients(pgdb)
    const stripe = accounts
      .find((a) => a.accountId === accountId)
      .stripe

    const paymentIntent = await stripe.paymentIntents.retrieve(
      paymentIntentId
    )
    console.log({ event, accountId, paymentIntentId, pledgeId, paymentIntent })
    */

    if (eventType === 'payment_intent.succeeded') {
      console.log('payment_intent.succeeded gogogogo!')

      const charge = event?.data?.object?.charges?.data[0]
      if (!charge) {
        console.warn('received PaymentIntent webhook without charge')
        return 503
      }

      let updatedPledge
      await forUpdate({
        pledgeId,
        pgdb,
        fn: async ({ pledge, transaction }) => {
          if (!pledge) {
            console.error('payment_intent.succeed pledge not found.')
            return
          }

          await savePaymentDedup(
            {
              pledgeId: pledge.id,
              chargeId: charge.id,
              total: charge.amount,
              transaction,
            },
            context,
          )

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
        },
      })

      if (updatedPledge) {
        const user = await pgdb.public.users.findOne({
          id: updatedPledge.userId,
        })

        await afterChange(
          {
            user,
            pledge: updatedPledge,
          },
          context,
        )
      }
    }

    return 200
  },
}
