const { Roles } = require('@orbiting/backend-modules-auth')
const { publishMonitor } = require('../../../../../lib/slack')
const { canReset } = require('../Membership')

module.exports = async (_, args, context) => {
  const { pgdb, req, t, user: me, mail: { enforceSubscriptions } } = context
  Roles.ensureUserHasRole(me, 'supporter')

  const { id: membershipId } = args

  const membership = await pgdb.public.memberships.findOne({ id: membershipId })
  if (!membership) {
    throw new Error(t('api/membership/404'))
  }

  const transaction = await pgdb.transactionBegin()

  try {
    await canReset(
      membership,
      { throwError: true },
      { ...context, pgdb: transaction }
    )

    await transaction.public.membershipPeriods.delete({ membershipId })

    const pledge = await transaction.public.pledges.findOne({ id: membership.pledgeId })

    const voucherCode = await transaction.queryOneField(
      'SELECT make_hrid(\'"memberships"\'::regclass, \'voucherCode\'::text, 6::bigint)'
    )

    const updatedMembership = await transaction.public.memberships.updateAndGetOne(
      { id: membershipId },
      {
        active: false, // disable membership
        userId: pledge.userId, // return membership to pledger
        voucherCode, // generate new voucher code
        voucherable: true,
        updatedAt: new Date()
      }
    )

    await transaction.transactionCommit()

    const { active, id, sequenceNumber, userId } = updatedMembership

    try {
      if (active) {
        await enforceSubscriptions({ pgdb, userId })
      }
    } catch (e) {
      // ignore issues with newsletter subscriptions
      console.warn('newsletter subscription changes failed', { req: req._log(), args, error: e })
    }

    try {
      await publishMonitor(
        req.user,
        `resetMembership (id: ${id}) #${sequenceNumber}\n{ADMIN_FRONTEND_BASE_URL}/users/${userId}`
      )
    } catch (e) {
      // swallow slack message
      console.warn('publish to slack failed', { req: req._log(), args, error: e })
    }

    return updatedMembership
  } catch (e) {
    console.error('resetMembership', e, { req: req._log() })
    await transaction.transactionRollback()
    throw e
  }
}
