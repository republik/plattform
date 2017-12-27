const { sendMailTemplate } = require('@orbiting/backend-modules-mail')

module.exports = {
  eventTypes: ['customer.subscription.updated', 'customer.subscription.deleted'],
  handle: async (event, pgdb, t) => {
    const subscription = event.data.object
    const pledgeId = subscription.metadata.pledgeId

    const transaction = await pgdb.transactionBegin()
    try {
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
        throw new Error('pledge for customer.subscription event not found! subscriptionId:' + subscription.id)
      }

      if (subscription.cancel_at_period_end) {
        await transaction.public.memberships.update({
          pledgeId
        }, {
          renew: false,
          updatedAt: new Date()
        })
      }

      // Possible values are trialing, active, past_due, canceled, or unpaid
      // https://stripe.com/docs/api/node#subscription_object
      if (subscription.status === 'canceled') {
        const existingMembership = await transaction.public.memberships.findFirst({
          pledgeId
        })
        // membership might have been moved by cancelPledge
        if (existingMembership) {
          await transaction.public.memberships.update({
            pledgeId
          }, {
            active: false,
            renew: false,
            updatedAt: new Date()
          })

          const user = await transaction.public.users.findOne({
            id: pledge.userId
          })

          if (existingMembership.active) {
            await sendMailTemplate({
              to: user.email,
              subject: t('api/email/subscription/deactivated/subject'),
              templateName: 'subscription_end',
              globalMergeVars: [
                { name: 'NAME',
                  content: [user.firstName, user.lastName]
                  .filter(Boolean)
                  .join(' ')
                }
              ]
            })
          }
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
