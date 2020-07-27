const { Roles } = require('@orbiting/backend-modules-auth')
const activateMembership = require('../../../lib/activateMembership')
const { publishMonitor } = require('../../../../../lib/slack')

module.exports = async (_, args, { pgdb, req, t, user: me, mail: { enforceSubscriptions } }) => {
  Roles.ensureUserHasRole(me, 'supporter')

  const { id: membershipId } = args

  let activatedMembership
  const transaction = await pgdb.transactionBegin()

  try {
    const periods = await transaction.public.membershipPeriods.find({ membershipId })
    if (periods.length) {
      throw new Error(t('api/membership/activate/hasPeriods'))
    }

    const membership = await transaction.public.memberships.findOne({ id: membershipId })
    if (!membership) {
      throw new Error(t('api/membership/404'))
    }

    if (membership.active) {
      throw new Error(t('api/membership/activate/alreadyActive'))
    }

    const user = await transaction.public.users.findOne({ id: membership.userId })
    if (!user) {
      throw new Error(t('api/membership/activate/userMissing'))
    }

    activatedMembership = await activateMembership(membership, user, t, transaction)
    if (!activatedMembership) {
      throw new Error(t('api/membership/activate/missingActivatedMembership'))
    }

    await transaction.transactionCommit()
  } catch (e) {
    console.error('activateMembership', e, { req: req._log() })
    await transaction.transactionRollback()
    throw e
  }

  const { active, id, sequenceNumber, userId } = activatedMembership

  try {
    if (active) {
      await enforceSubscriptions({
        pgdb,
        userId,
        subscribeToEditorialNewsletters: true
      })
    }
  } catch (e) {
    // ignore issues with newsletter subscriptions
    console.warn('newsletter subscription changes failed', { req: req._log(), args, error: e })
  }

  try {
    await publishMonitor(
      req.user,
      `activateMembership (id: ${id}) #${sequenceNumber}\n{ADMIN_FRONTEND_BASE_URL}/users/${userId}`
    )
  } catch (e) {
    // swallow slack message
    console.warn('publish to slack failed', { req: req._log(), args, error: e })
  }

  return activatedMembership
}
