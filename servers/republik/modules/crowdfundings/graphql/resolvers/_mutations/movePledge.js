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
    const pledge = await transaction.public.pledges.findOne({ id: pledgeId })
    if (!pledge) {
      throw new Error(t('api/pledge/404'))
    }

    const user = await transaction.public.users.findOne({ id: userId })
    if (!user) {
      throw new Error(t('api/users/404'))
    }

    if (pledge.userId === user.id) {
      console.info('movePledge: pledge already belongs to target user')
      await transaction.transactionCommit()
      return pledge
    }

    // only move unclaimed memberships with the pledge
    const membershipsFind = {
      pledgeId: pledge.id,
      userId: pledge.userId
    }
    const memberships = await transaction.public.memberships.find(membershipsFind)
    if (memberships.length > 0) {
      const membershipType = await transaction.public.membershipTypes.findOne({
        id: memberships[0].membershipTypeId
      })
      if (membershipType.name === 'MONTHLY_ABO') {
        throw new Error(t('api/membership/move/monthlyDenied'))
      }
    }

    // avoid multiple active memberships for one user
    const userHasActiveMembership = !!await transaction.public.memberships.findFirst({
      userId: user.id,
      active: true
    })
    if (userHasActiveMembership && memberships.filter(m => m.active).length > 0) {
      throw new Error(t('api/membership/move/otherActive'))
    }

    // update
    const newPledge = await transaction.public.pledges.updateAndGetOne(
      { id: pledge.id },
      {
        userId: user.id,
        updatedAt: now
      }
    )
    await transaction.public.memberships.update(membershipsFind,
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
    console.error('movePledge', e, { req: req._log() })
    await transaction.transactionRollback()
    throw e
  }
}
