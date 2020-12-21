const { Roles } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, context) => {
  const { pgdb, loaders, user: me } = context

  Roles.ensureUserIsInRoles(me, ['admin', 'supporter'])

  const suspensions = await loaders.DiscussionSuspension.byUserId.load(args.id)

  if (suspensions.length) {
    const tx = await pgdb.transactionBegin()
    try {
      const now = new Date()

      await pgdb.public.discussionSuspensions.update(
        { id: suspensions.map((s) => s.id) },
        { endAt: now, updatedAt: now },
      )

      await tx.transactionCommit()
    } catch (e) {
      await tx.transactionRollback()
      throw e
    }

    loaders.DiscussionSuspension.clear(args.id)
  }

  return loaders.User.byId.load(args.id)
}
