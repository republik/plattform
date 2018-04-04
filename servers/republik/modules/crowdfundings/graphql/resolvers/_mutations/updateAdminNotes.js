const { Roles } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, {pgdb, req, user: me, t}) => {
  Roles.ensureUserHasRole(me, 'supporter')

  const {
    userId,
    notes
  } = args

  const user = await pgdb.public.users.findOne({id: args.userId})
  if (!user) {
    console.error('user not found', { req: req._log() })
    throw new Error(t('api/users/404'))
  }

  return pgdb.public.users.updateAndGetOne(
    {
      id: userId
    },
    {
      adminNotes: notes,
      updatedAt: new Date()
    }
  )
}
