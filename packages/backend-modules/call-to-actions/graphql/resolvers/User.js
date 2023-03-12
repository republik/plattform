const dayjs = require('dayjs')

const { Roles } = require('@orbiting/backend-modules-auth')

const { getCache } = require('../../lib/cache')

module.exports = {
  callToActions: async (user, args, context) => {
    const { user: me } = context

    if (!Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter'])) {
      throw new Error('api/call-to-action/notAllowed')
    }

    return getCache(user.id, context).cache(async () => {
      const now = dayjs()

      // Find latest ackknowledgedAt
      const lastestAcknowledgedAt =
        await context.pgdb.public.callToActions.findOneFieldOnly(
          {
            userId: user.id,
            'acknowledgedAt !=': null,
          },
          'acknowledgedAt',
          {
            orderBy: { acknowledgedAt: 'desc' },
            limit: 1,
          },
        )

      if (lastestAcknowledgedAt) {
        // Get end of day of acknowledgedAt as thresholdTimestamp
        const thresholdTimestamp = dayjs(lastestAcknowledgedAt).endOf('day')

        // Check if thresholdTimestamp is after now
        if (!now.isAfter(thresholdTimestamp)) {
          return []
        }
      }

      // Find oldest callToActions row by oldest beginAt
      return context.pgdb.public.callToActions.find(
        {
          userId: user.id,
          'beginAt <=': now,
          'endAt >': now,
          acknowledgedAt: null,
        },
        {
          orderBy: 'beginAt',
          limit: 1,
        },
      )
    })
  },
}
