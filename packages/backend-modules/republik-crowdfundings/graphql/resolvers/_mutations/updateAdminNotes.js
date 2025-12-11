const { Roles } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, context) => {
  const { pgdb, user: me, t } = context
  Roles.ensureUserHasRole(me, 'supporter')

  const { userId, notes } = args

  const user = await pgdb.public.users.findOne({ id: args.userId })
  if (!user) {
    context.logger.error('user not found')
    throw new Error(t('api/users/404'))
  }

  return pgdb.public.users.updateAndGetOne(
    {
      id: userId,
    },
    {
      adminNotes: notes,
      updatedAt: new Date(),
    },
  )
}
