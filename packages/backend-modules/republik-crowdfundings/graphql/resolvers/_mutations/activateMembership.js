const { Roles } = require('@orbiting/backend-modules-auth')
const activateMembership = require('../../../lib/activateMembership')
const {
  publishMonitor,
} = require('@orbiting/backend-modules-republik/lib/slack')

module.exports = async (_, args, context) => {
  const {
    pgdb,
    req,
    t,
    user: me,
    mail: { enforceSubscriptions },
  } = context
  Roles.ensureUserHasRole(me, 'supporter')

  const { id: membershipId } = args

  let activatedMembership
  const transaction = await pgdb.transactionBegin()

  try {
    const periods = await transaction.public.membershipPeriods.find({
      membershipId,
    })
    if (periods.length) {
      throw new Error(t('api/membership/activate/hasPeriods'))
    }

    const membership = await transaction.public.memberships.findOne({
      id: membershipId,
    })
    if (!membership) {
      throw new Error(t('api/membership/404'))
    }

    if (membership.active) {
      throw new Error(t('api/membership/activate/alreadyActive'))
    }

    const user = await transaction.public.users.findOne({
      id: membership.userId,
    })
    if (!user) {
      throw new Error(t('api/membership/activate/userMissing'))
    }

    const { updatedMembership } = await activateMembership(
      membership,
      user,
      t,
      transaction,
    )

    activatedMembership = updatedMembership

    if (!activatedMembership) {
      throw new Error(t('api/membership/activate/missingActivatedMembership'))
    }

    await transaction.transactionCommit()
  } catch (e) {
    context.logger.error({ error: e }, 'activateMembership failed')
    await transaction.transactionRollback()
    throw e
  }

  const { active, id, sequenceNumber, userId } = activatedMembership

  try {
    if (active) {
      await enforceSubscriptions({
        pgdb,
        userId,
        subscribeToEditorialNewsletters: true,
      })
    }
  } catch (e) {
    // ignore issues with newsletter subscriptions
    context.logger.warn(
      {
        args,
        error: e,
      },
      'newsletter subscription changes failed',
    )
  }

  try {
    await publishMonitor(
      req.user,
      `activateMembership (id: ${id}) #${sequenceNumber}\n{ADMIN_FRONTEND_BASE_URL}/users/${userId}`,
    )
  } catch (e) {
    // swallow slack message
    context.logger.warn({ args, error: e }, 'publish to slack failed')
  }

  return activatedMembership
}
