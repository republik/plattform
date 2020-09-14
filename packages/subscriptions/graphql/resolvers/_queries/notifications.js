const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const paginate = require('../../../lib/paginateNotificationConnection')

const MAX_RECORDS = 1000

module.exports = async (_, args, context) => {
  const { req, pgdb, user: me } = context
  ensureSignedIn(req)

  const nodes = await pgdb.public.notifications.find(
    {
      userId: me.id,
      ...(args.onlyUnread ? { readAt: null } : {}),
    },
    {
      orderBy: { createdAt: 'DESC' },
      limit: MAX_RECORDS,
    },
  )

  return paginate(
    {
      ...args,
      first: Math.min(args.first || 100, 100),
    },
    nodes,
  )
}
