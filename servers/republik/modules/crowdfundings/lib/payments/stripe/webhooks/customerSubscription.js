const _ = { get: require('lodash/get') }

const { sendMailTemplate } = require('@orbiting/backend-modules-mail')

const { enforceSubscriptions } = require('../../../Mail')
const activateYearlyMembership = require('../../../activateYearlyMembership')

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

      const existingMembership = await transaction.public.memberships.findFirst({
        pledgeId
      })

      if (subscription.cancel_at_period_end) {
        await transaction.public.memberships.update({
          pledgeId
        }, {
          renew: false,
          updatedAt: new Date()
        })
      } else if (subscription.status !== 'canceled') {
        await transaction.public.memberships.update({
          pledgeId
        }, {
          renew: true,
          updatedAt: new Date()
        })
      }

      // Possible values are trialing, active, past_due, canceled, or unpaid
      // https://stripe.com/docs/api/node#subscription_object
      if (subscription.status === 'canceled' && existingMembership) {
        await transaction.public.memberships.update({
          pledgeId
        }, {
          active: false,
          renew: false,
          updatedAt: new Date()
        })

        const nextMembership = await activateYearlyMembership(
          await transaction.public.memberships.find({
            userId: existingMembership.userId
          }),
          transaction
        )

        if (existingMembership.active && !nextMembership) {
          const user = await transaction.public.users.findOne({
            id: pledge.userId
          })

          await sendMailTemplate({
            to: user.email,
            subject: t('api/email/subscription/deactivated/subject'),
            templateName: 'subscription_end',
            globalMergeVars: [
              {
                name: 'name',
                content: [user.firstName, user.lastName]
                  .filter(Boolean)
                  .join(' ')
              },
              /**
               * `is_automatic_overdue_cancel` should be true, if a a subscription is deleted past
               * due and event was fired automatic (not via API).
               */
              {
                name: 'is_automatic_overdue_cancel',
                content:
                  !!existingMembership.renew &&
                  !!_.get(event, 'data.object.cancel_at_period_end') &&
                  !_.get(event, 'data.request.id')
              }
            ]
          }, { pgdb })
        }
      }
      await transaction.transactionCommit()

      enforceSubscriptions({ pgdb, userId: pledge.userId })
    } catch (e) {
      await transaction.transactionRollback()
      console.info('transaction rollback', { error: e })
      console.error(e)
      throw e
    }
  }
}
