const { Roles: { ensureUserIsInRoles } } = require('@orbiting/backend-modules-auth')
const { hasUserActiveMembership } = require('@orbiting/backend-modules-utils')

module.exports = async (_, args, { pgdb, req, user: me, t, mail: { enforceSubscriptions } }) => {
  ensureUserIsInRoles(me, ['supporter'])

  const {
    membershipId,
    userId
  } = args

  const transaction = await pgdb.transactionBegin()
  const now = new Date()
  try {
    const membership = await transaction.public.memberships.findOne({ id: membershipId })
    if (!membership) {
      throw new Error(t('api/membership/404'))
    }
    const membershipType = await transaction.public.membershipTypes.findOne({
      id: membership.membershipTypeId
    })
    if (membershipType.name === 'MONTHLY_ABO') {
      throw new Error(t('api/membership/move/monthlyDenied'))
    }

    const user = await transaction.public.users.findOne({ id: userId })
    if (!user) {
      throw new Error(t('api/users/404'))
    }

    if (membership.userId === user.id) {
      console.info('moveMembership: membership already belongs to target user')
      await transaction.transactionCommit()
      return membership
    }

    if (membership.active && (await hasUserActiveMembership(user, transaction))) {
      throw new Error(t('api/membership/move/otherActive'))
    }

    const newMembership = await transaction.public.memberships.updateAndGetOne(
      { id: membership.id },
      {
        userId: user.id,
        voucherCode: null,
        voucherable: false,
        updatedAt: now
      }
    )

    await transaction.transactionCommit()

    try {
      await enforceSubscriptions({ pgdb, userId: membership.userId })
      await enforceSubscriptions({ pgdb, userId })
    } catch (e2) {
      // ignore issues with newsletter subscriptions
      console.error('newsletter subscription changes failed', { req: req._log(), args, error: e2 })
    }

    return newMembership
  } catch (e) {
    console.error('movePledge', e, { req: req._log() })
    await transaction.transactionRollback()
    throw e
  }
}
