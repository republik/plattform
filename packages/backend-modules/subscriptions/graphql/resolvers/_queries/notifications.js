const paginate = require('../../../lib/paginateNotificationConnection')
const moment = require('moment')

const MAX_RECORDS = 100

module.exports = async (_, args, context) => {
  const { req, pgdb, user: me } = context

  if (!req.user) {
    return null
  }

  const nodes = await pgdb.public.notifications.find(
    {
      ...(args.onlyUnread ? { readAt: null } : {}),
      ...(args.lastDays
        ? { 'updatedAt >=': moment().subtract(args.lastDays, 'days') }
        : {}),
      ...(args.filter ? { eventObjectType: args.filter } : {}),
      userId: me.id,
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
