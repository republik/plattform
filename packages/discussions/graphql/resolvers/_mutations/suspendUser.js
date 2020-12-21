const { Roles } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, context) => {
  const { pgdb, loaders, user: me } = context

  Roles.ensureUserIsInRoles(me, ['admin', 'supporter'])

  const tx = await pgdb.transactionBegin()
  try {
    await pgdb.public.discussionSuspensions.insert({
      userId: args.id,
      beginAt: new Date(),
      ...(args.until && { endAt: args.until }),
      ...(args.reason && { reason: args.reason }),
    })
    await tx.transactionCommit()
  } catch (e) {
    await tx.transactionRollback()
    throw e
  }

  loaders.DiscussionSuspension.clear(args.id)

  return loaders.User.byId.load(args.id)
}
