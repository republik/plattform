const { Roles } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, context) => {
  const { pgdb, t, user: me } = context
  const {
    id: cancellationId,
    details: {
      reason,
      type,
      suppressWinback
    }
  } = args

  Roles.ensureUserIsInRoles(me, ['admin', 'supporter'])

  const cancellation = await pgdb.public.membershipCancellations.findOne({ id: cancellationId })
  if (!cancellation) {
    throw new Error(t('api/membershipCancellation/404'))
  }

  return pgdb.public.membershipCancellations.updateAndGetOne(
    { id: cancellation.id },
    {
      reason,
      category: type,
      suppressWinback
    }
  )
}
