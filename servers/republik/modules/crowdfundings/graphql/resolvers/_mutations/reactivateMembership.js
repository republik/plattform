const { Roles } = require('@orbiting/backend-modules-auth')
const getSubscription = require('../../../lib/payments/stripe/getSubscription')
const createSubscription = require('../../../lib/payments/stripe/createSubscription')
const reactivateSubscription = require('../../../lib/payments/stripe/reactivateSubscription')
const slack = require('../../../../../lib/slack')
const createCache = require('../../../lib/cache')
const { sendMailTemplate } = require('@orbiting/backend-modules-mail')

module.exports = async (_, args, context) => {
  const { pgdb, req, user: me, t, mail: { enforceSubscriptions } } = context
  const transaction = await pgdb.transactionBegin()
  const now = new Date()
  try {
    const {
      id: membershipId
    } = args

    const membership = await transaction.query(`
      SELECT
        m.*
      FROM
        memberships m
      WHERE
        id = :membershipId
      FOR UPDATE
    `, {
      membershipId
    })
      .then(result => result[0])
    if (!membership) {
      throw new Error(t('api/membership/404'))
    }

    const user = await transaction.public.users.findOne({ id: membership.userId })
    Roles.ensureUserIsMeOrInRoles(user, me, ['supporter'])

    const activeMembership = await transaction.public.memberships.findFirst({
      'id !=': membershipId,
      userId: user.id,
      active: true
    })
    if (activeMembership) {
      throw new Error(t('api/membership/reactivate/otherActive'))
    }

    const membershipType = await transaction.public.membershipTypes.findOne({
      id: membership.membershipTypeId
    })

    let newMembership
    if (membershipType.name === 'MONTHLY_ABO') {
      if (!membership.subscriptionId) {
        throw new Error(t('api/membership/pleaseWait'))
      }

      const subscription = await getSubscription({
        id: membership.subscriptionId,
        companyId: membershipType.companyId,
        pgdb: transaction
      })

      let newSubscription
      if (subscription.status === 'active') {
        // https://stripe.com/docs/subscriptions/canceling-pausing#reactivating-canceled-subscriptions
        newSubscription = await reactivateSubscription({
          id: membership.subscriptionId,
          item: {
            id: subscription.items.data[0].id,
            plan: membershipType.name
          },
          companyId: membershipType.companyId,
          pgdb: transaction
        })
      } else {
        newSubscription = await createSubscription({
          plan: membershipType.name,
          userId: membership.userId,
          companyId: membershipType.companyId,
          metadata: {
            pledgeId: membership.pledgeId,
            membershipId
          },
          pgdb: transaction
        })

        // this could go to the webhookHandler if we would not preactivate
        // the membership below
        try {
          await sendMailTemplate({
            to: user.email,
            subject: t('api/email/subscription/reactivated/subject'),
            templateName: 'subscription_reactivate',
            globalMergeVars: [
              { name: 'NAME',
                content: [user.firstName, user.lastName]
                  .filter(Boolean)
                  .join(' ')
              }
            ]
          }, context)
        } catch (e2) {
          console.warn(e2)
        }
      }

      // don't wait for stripe's webhook
      newMembership = await transaction.public.memberships.updateAndGetOne({
        id: membershipId
      }, {
        active: true,
        renew: true,
        subscriptionId: newSubscription.id,
        updatedAt: now
      })
    } else if (['ABO', 'BENEFACTOR_ABO'].includes(membershipType.name)) {
      if (membership.renew) {
        console.info('reactivateMembership: membership is already renew===true')
        await transaction.transactionCommit()
        return membership
      }

      if (!membership.active) {
        console.error(`reactivateMembership: unable to reactivate membership`)
        throw new Error(t('api/unexpected'))
      }

      newMembership = await transaction.public.memberships.updateAndGetOne({
        id: membershipId
      }, {
        renew: true,
        updatedAt: now
      })
    } else {
      console.error(`reactivateMembership: membershipType "${membershipType.name}" not supported`)
      throw new Error(t('api/unexpected'))
    }

    await transaction.transactionCommit()

    enforceSubscriptions({ pgdb, userId: membership.userId })

    await slack.publishMembership(
      user,
      membershipType.name,
      user.id === me.id
        ? 'reactivateMembership'
        : 'reactivateMembership (support)'
    )

    const cache = createCache({ prefix: `User:${user.id}` }, context)
    cache.invalidate()

    return newMembership
  } catch (e) {
    await transaction.transactionRollback()
    console.info('transaction rollback', { req: req._log(), args, error: e })
    throw e
  }
}
