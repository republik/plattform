const { Roles: { ensureUserIsInRoles } } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, { pgdb, req, user: me, t, mail: { enforceSubscriptions } }) => {
  ensureUserIsInRoles(me, ['supporter'])

  const {
    pledgeId,
    userId
  } = args

  const transaction = await pgdb.transactionBegin()
  const now = new Date()
  try {
    const pledge = await pgdb.public.pledges.findOne({ id: pledgeId })
    if (!pledge) {
      console.error('pledge not found', { req: req._log() })
      throw new Error(t('api/pledge/404'))
    }

    const user = await pgdb.public.users.findOne({ id: userId })
    if (!user) {
      console.error('user not found', { req: req._log() })
      throw new Error(t('api/users/404'))
    }

    if (pledge.userId === user.id) {
      console.info('movePledge: pledge already belongs to target user')
      return pledge
    }

    const newPledge = await pgdb.public.pledges.updateAndGetOne(
      { id: pledge.id },
      {
        userId: user.id,
        updatedAt: now
      }
    )

    // only move unclaimed memberships with the pledge
    await pgdb.public.memberships.update(
      {
        pledgeId: pledge.id,
        userId: pledge.userId
      },
      {
        userId: user.id,
        updatedAt: now
      }
    )

    await transaction.transactionCommit()

    try {
      await enforceSubscriptions({ pgdb, userId: pledge.userId })
      await enforceSubscriptions({ pgdb, userId })
    } catch (e2) {
      // ignore issues with newsletter subscriptions
      console.error('newsletter subscription changes failed', { req: req._log(), args, error: e2 })
    }

    return newPledge
  } catch (e) {
    console.error('movePledge', e)
    await transaction.transactionRollback()
    throw new Error(t('api/unexpected'))
  }
}
