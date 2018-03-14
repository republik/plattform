const { Roles: { ensureUserIsInRoles } } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, { pgdb, req, user: me, t, mail: { enforceSubscriptions } }) => {
  ensureUserIsInRoles(me, ['supporter'])

  const {
    membershipId,
    userId
  } = args

  const transaction = await pgdb.transactionBegin()
  const now = new Date()
  try {
    const membership = await pgdb.public.memberships.findOne({ id: membershipId })
    if (!membership) {
      console.error('membership not found', { req: req._log() })
      throw new Error(t('api/membership/404'))
    }

    const user = await pgdb.public.users.findOne({ id: userId })
    if (!user) {
      console.error('user not found', { req: req._log() })
      throw new Error(t('api/users/404'))
    }

    if (membership.userId === user.id) {
      console.info('moveMembership: membership already belongs to target user')
      await transaction.transactionCommit()
      return membership
    }

    const newMembership = await pgdb.public.memberships.updateAndGetOne(
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
    console.error('moveMembership', e)
    await transaction.transactionRollback()
    throw e
  }
}
