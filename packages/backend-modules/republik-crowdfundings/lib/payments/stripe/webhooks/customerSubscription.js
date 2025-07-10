const _ = { get: require('lodash/get') }

const { sendMailTemplate } = require('@orbiting/backend-modules-mail')

const { enforceSubscriptions } = require('../../../Mail')
const activateMembership = require('../../../activateMembership')
const { forUpdate } = require('../../Pledge')
const electDormantMembership = require('../../../electDormantMembership')

const DEV = process.env.NODE_ENV ? process.env.NODE_ENV !== 'production' : true

module.exports = {
  eventTypes: [
    'customer.subscription.updated',
    'customer.subscription.deleted',
  ],
  handle: (event, pgdb, t) => {
    const subscription = event.data.object
    const pledgeId = subscription.metadata.pledgeId

    if (!pledgeId) {
      // new subscriptions do not contain a pledge id skip this event handler
      return 204
    }

    return forUpdate({
      pledgeId,
      pgdb,
      fn: async ({ pledge, transaction }) => {
        if (!pledge) {
          if (!DEV) {
            console.error(`${event.type} pledge not found for id: ${pledgeId}`)
          }
          return 503
        }

        const existingMembership =
          await transaction.public.memberships.findFirst({
            pledgeId,
          })

        if (subscription.cancel_at_period_end) {
          await transaction.public.memberships.update(
            {
              pledgeId,
            },
            {
              renew: false,
              updatedAt: new Date(),
            },
          )
        } else if (subscription.status !== 'canceled') {
          await transaction.public.memberships.update(
            {
              pledgeId,
            },
            {
              renew: true,
              updatedAt: new Date(),
            },
          )
        }

        // Possible values are trialing, active, past_due, canceled, or unpaid
        // https://stripe.com/docs/api/node#subscription_object
        if (subscription.status === 'canceled' && existingMembership) {
          await transaction.public.memberships.update(
            {
              pledgeId,
            },
            {
              active: false,
              renew: false,
              updatedAt: new Date(),
            },
          )

          const user = await transaction.public.users.findOne({
            id: pledge.userId,
          })

          const changeoverMembership = await electDormantMembership(
            user,
            transaction,
          )

          if (changeoverMembership) {
            await activateMembership(changeoverMembership, user, t, transaction)
          } else if (existingMembership.active && !changeoverMembership) {
            await sendMailTemplate(
              {
                to: user.email,
                subject: t('api/email/subscription/deactivated/subject'),
                templateName: 'subscription_end',
                globalMergeVars: [
                  {
                    name: 'name',
                    content: [user.firstName, user.lastName]
                      .filter(Boolean)
                      .join(' '),
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
                      !_.get(event, 'data.request.id'),
                  },
                ],
              },
              { pgdb },
            )
          }
        }

        await enforceSubscriptions({ pgdb, userId: pledge.userId })

        return 200
      },
    })
  },
}
