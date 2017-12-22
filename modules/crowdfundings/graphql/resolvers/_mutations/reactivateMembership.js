const createSubscription = require('../../../lib/payments/stripe/createSubscription')
const { sendMailTemplate } = require('@orbiting/backend-modules-mail')

module.exports = async (_, args, {pgdb, req, t}) => {
  const transaction = await pgdb.transactionBegin()
  try {
    const {
      id: membershipId,
      membershipTypeId
    } = args

    const membership = await transaction.public.memberships.findOne({
      id: membershipId
    })
    if (!membership) {
      throw new Error(t('api/membershipType/404'))
    }
    if (membership.active === true) {
      throw new Error(t('api/membership/reactivate/isActive'))
    }

    const membershipType = await transaction.public.membershipTypes.findOne({
      id: membershipTypeId
    })
    if (!membershipType) {
      throw new Error(t('api/membershipType/404'))
    }

    // TODO
    if (membershipType.name !== 'MONTHLY_ABO') {
      throw new Error('ABO and BENEFACTOR_ABO not yet elegitable for reactivateMembership')
    }

    await createSubscription({
      plan: membershipType.name,
      userId: membership.userId,
      companyId: membershipType.companyId,
      metadata: {
        pledgeId: membership.pledgeId,
        membershipId
      },
      pgdb: transaction
    })

    // don't wait for stripe's webhook
    const newMembership = await transaction.public.memberships.updateAndGetOne({
      id: membershipId
    }, {
      active: true
    })

    // this could go to the webhookHandler if we would not preactivate
    // the membership above
    const user = await transaction.public.users.findOne({
      id: membership.userId
    })
    await transaction.transactionCommit()

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
    })

    return newMembership
  } catch (e) {
    await transaction.transactionRollback()
    console.info('transaction rollback', { req: req._log(), args, error: e })
    throw e
  }
}
