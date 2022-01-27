const { Roles } = require('@orbiting/backend-modules-auth')

const slack = require('../../../lib/slack')

const DEFAULT_INTERVAL_DAYS = 7

module.exports = async (_, args, context) => {
  const { pgdb, loaders, user: me } = context

  Roles.ensureUserIsInRoles(me, ['supporter', 'admin'])

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

  const suspensions = await loaders.DiscussionSuspension.byUserId.load(args.id)
  const user = await loaders.User.byId.load(args.id)

  await slack.publishUserSuspended(suspensions, user, context)

  return user
}
