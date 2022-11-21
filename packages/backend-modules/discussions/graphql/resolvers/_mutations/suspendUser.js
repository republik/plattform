const { Roles } = require('@orbiting/backend-modules-auth')
const dayjs = require('dayjs')

const slack = require('../../../lib/slack')

const DEFAULT_INTERVAL_DAYS = 7

module.exports = async (_, args, context) => {
  const { pgdb, loaders, user: me } = context
  const { id: userId, interval, intervalAmount, reason } = args

  Roles.ensureUserIsInRoles(me, ['supporter', 'admin'])

  const tx = await pgdb.transactionBegin()
  try {
    const now = dayjs()
    const endAt =
      interval && intervalAmount
        ? now.add(intervalAmount, interval)
        : args.until || // deprecated arg
          now.add(DEFAULT_INTERVAL_DAYS, 'day')

    await pgdb.public.discussionSuspensions.insert({
      userId,
      beginAt: now,
      endAt,
      issuerUserId: me.id,
      ...(reason && { reason }),
    })
    await tx.transactionCommit()
  } catch (e) {
    await tx.transactionRollback()
    throw e
  }

  loaders.DiscussionSuspension.clear(userId)

  const suspensions = await loaders.DiscussionSuspension.byUserId.load(userId)
  const user = await loaders.User.byId.load(userId)

  await slack.publishUserSuspended(suspensions, user, context)

  return user
}
