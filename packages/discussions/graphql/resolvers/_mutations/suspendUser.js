const { Roles } = require('@orbiting/backend-modules-auth')

const DEFAULT_INTERVAL_DAYS = 7

module.exports = async (_, args, context) => {
  const { pgdb, loaders, user: me } = context

  Roles.ensureUserIsInRoles(me, ['admin', 'supporter'])

  const tx = await pgdb.transactionBegin()
  try {
    const now = new Date()
    await pgdb.public.discussionSuspensions.insert({
      userId: args.id,
      beginAt: now,
      endAt:
        args.until || new Date().setDate(now.getDate() + DEFAULT_INTERVAL_DAYS),
      issuerUserId: me.id,
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
