const _ = {
  get: require('lodash/get')
}

// invoice.payment_succeeded includes:
// pledgeId, charge total and charge id
// but not the charge details, charge may not
// exist at the time this hook is received
module.exports = {
  eventTypes: ['invoice.payment_succeeded'],
  handle: async (event, pgdb, t) => {
    const invoice = _.get(event, 'data.object')
    const subscription = _.get(event, 'data.object.lines.data[0]')
    if (subscription.type === 'subscription') {
      const {
        charge: chargeId,
        total
      } = invoice
      const pledgeId = subscription.metadata.pledgeId

      const transaction = await pgdb.transactionBegin()
      try {
        // synchronize with payPledge
        const pledge = await transaction.query(`
          SELECT *
          FROM pledges
          WHERE id = :pledgeId
          FOR UPDATE
        `, {
          pledgeId
        })
          .then(response => response[0])
          .catch(e => {
            console.error(e)
            return null
          })

        if (!pledge) {
          console.warn(`received webhook for unknown pledgeId ${pledgeId}`)
          await transaction.transactionRollback()
          return 500
        }

        // save payment deduplicated
        const existingPayment = await transaction.public.payments.findFirst({
          method: 'STRIPE',
          pspId: chargeId
        })
        if (!existingPayment) {
          const payment = await transaction.public.payments.insertAndGet({
            type: 'PLEDGE',
            method: 'STRIPE',
            total: total,
            status: 'PAID',
            pspId: chargeId
          })

          await transaction.public.pledgePayments.insert({
            pledgeId,
            paymentId: payment.id,
            paymentType: 'PLEDGE'
          })
        }

        // save membershipPeriod
        const memberships = await transaction.public.memberships.find({
          pledgeId
        })
        const firstNotification = memberships[0].subscriptionId === null
        const beginDate = new Date(subscription.period.start * 1000)
        const endDate = new Date(subscription.period.end * 1000)
        if (firstNotification) {
          // remember subscriptionId
          await transaction.public.memberships.update({
            id: memberships.map(m => m.id)
          }, {
            subscriptionId: subscription.id
          })
          // synchronize beginDate and endDate with stripe
          await transaction.query(`
            UPDATE "membershipPeriods" mp
            SET
              "webhookEventId" = :webhookEventId,
              "beginDate" = :beginDate,
              "endDate" = :endDate,
              "updatedAt" = :now
            WHERE
              ARRAY[mp."membershipId"] && :membershipIds AND
              mp."webhookEventId" is null
          `, {
            webhookEventId: event.id,
            beginDate,
            endDate,
            now: new Date(),
            membershipIds: memberships.map(m => m.id)
          })
        } else {
          // check for duplicate event
          if (!(await transaction.public.membershipPeriods.findFirst({
            webhookEventId: event.id })
          )) {
            // insert membershipPeriods
            await Promise.all(memberships.map(membership => {
              return transaction.public.membershipPeriods.insert({
                membershipId: membership.id,
                beginDate,
                endDate,
                webhookEventId: event.id
              })
            }))
            await transaction.public.memberships.update({
              id: memberships.map(m => m.id)
            }, {
              active: true,
              updatedAt: new Date()
            })
          }
        }
        await transaction.transactionCommit()
      } catch (e) {
        await transaction.transactionRollback()
        console.info('transaction rollback', { error: e })
        console.error(e)
        throw e
      }
    }
  }
}
