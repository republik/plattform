const {
  forUpdate,
  savePaymentDedup,
  changeStatus,
  afterChange,
} = require('../../Pledge')

const DEV = process.env.NODE_ENV ? process.env.NODE_ENV !== 'production' : true

// used by stripe subscriptions (source or paymentMethod)
// not used by stripe paymentIntent
//
// invoice.payment_succeeded includes:
// pledgeId, charge total and charge id
// but not the charge details, charge may not
// exist at the time this hook is received
module.exports = {
  eventTypes: ['invoice.payment_succeeded'],
  handle: async (event, pgdb, t, redis, connectionContext) => {
    const context = {
      ...connectionContext,
      t,
    }

    const invoice = event.data?.object
    const subscription = event.data?.object?.lines?.data[0]

    if (subscription.type === 'subscription') {
      const { charge: chargeId, total } = invoice
      const pledgeId = subscription.metadata.pledgeId

      // stripe/payPledge might be waiting for clientSecret
      // publish that no auth is required
      await redis.publish(`pledge:${pledgeId}:clientSecret`, 'no-auth-required')

      let updatedPledge
      const result = await forUpdate({
        pledgeId,
        pgdb,
        fn: async ({ pledge, transaction }) => {
          if (!pledge) {
            if (!DEV) {
              console.warn(`${event.type} pledge not found for id: ${pledgeId}`)
            }
            return 503
          }

          await savePaymentDedup({
            pledgeId,
            chargeId,
            total,
            transaction,
          })

          if (pledge.status === 'DRAFT') {
            updatedPledge = await changeStatus(
              {
                pledge,
                newStatus: 'SUCCESSFUL',
                transaction,
              },
              context,
            )
          }

          // save membershipPeriod
          const memberships = await transaction.public.memberships.find({
            pledgeId,
          })
          const firstNotification = memberships[0].subscriptionId === null
          const beginDate = new Date(subscription.period.start * 1000)
          const endDate = new Date(subscription.period.end * 1000)
          if (firstNotification) {
            // remember subscriptionId
            await transaction.public.memberships.update(
              {
                id: memberships.map((m) => m.id),
              },
              {
                subscriptionId: subscription.id,
              },
            )
            // synchronize beginDate and endDate with stripe
            await transaction.query(
              `
              UPDATE "membershipPeriods" mp
              SET
                "webhookEventId" = :webhookEventId,
                "beginDate" = :beginDate,
                "endDate" = :endDate,
                "updatedAt" = :now
              WHERE
                ARRAY[mp."membershipId"] && :membershipIds AND
                mp."webhookEventId" is null
            `,
              {
                webhookEventId: event.id,
                beginDate,
                endDate,
                now: new Date(),
                membershipIds: memberships.map((m) => m.id),
              },
            )
          } else {
            // check for duplicate event
            if (
              !(await transaction.public.membershipPeriods.findFirst({
                webhookEventId: event.id,
              }))
            ) {
              // insert membershipPeriods
              await Promise.all(
                memberships.map((membership) => {
                  return transaction.public.membershipPeriods.insert({
                    membershipId: membership.id,
                    pledgeId: pledge.id,
                    beginDate,
                    endDate,
                    webhookEventId: event.id,
                  })
                }),
              )
              await transaction.public.memberships.update(
                {
                  id: memberships.map((m) => m.id),
                },
                {
                  active: true,
                  updatedAt: new Date(),
                },
              )
            }
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
    }
  },
}
