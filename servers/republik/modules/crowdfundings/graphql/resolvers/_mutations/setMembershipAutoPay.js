const { Roles } = require('@orbiting/backend-modules-auth')
const { autoPayIsMutable: autoPayIsMutableResolver } = require('../Membership')
const createCache = require('../../../lib/cache')
const { publishMonitor } = require('../../../../../lib/slack')

module.exports = async (_, { id, autoPay }, context) => {
  const { user: me, t, req } = context
  Roles.ensureUserHasRole(me, 'supporter')

  const transaction = await context.pgdb.transactionBegin()

  try {
    const membership = await transaction.public.memberships.findOne({
      id: id
    })

    if (!membership) {
      throw new Error(t('api/membership/404'))
    }

    const autoPayIsMutable = await autoPayIsMutableResolver(membership, null, { ...context, pgdb: transaction })

    if (!autoPayIsMutable) {
      throw new Error(
        t('api/membership/auto_pay_not_mutable', { id: membership.id })
      )
    }

    if (membership.autoPay === autoPay) {
      return membership
    }

    const updatedMembership = await transaction.public.memberships.updateAndGetOne({
      id
    }, {
      autoPay
    })

    await transaction.transactionCommit()

    await createCache({
      prefix: `User:${membership.userId}`
    }, { redis: context.redis }).invalidate()

    try {
      await publishMonitor(
        req.user,
        `setMembershipAutoPay (id: ${id}) #${membership.sequenceNumber} to *${autoPay ? 'TRUE' : 'FALSE'}*\n{ADMIN_FRONTEND_BASE_URL}/users/${membership.userId}`
      )
    } catch (e) {
      // swallow slack message
      console.warn('publish to slack failed', { req: req._log(), error: e })
    }

    return updatedMembership
  } catch (e) {
    await transaction.transactionRollback()
    console.error('setMembershipAutoPay', e, { req: req._log() })
    throw e
  }
}
