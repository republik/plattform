const { Roles } = require('@orbiting/backend-modules-auth')

const { getCache } = require('../../lib/cache')

module.exports = {
  callToActions: async (user, args, context) => {
    const { user: me } = context

    if (!Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter'])) {
      throw new Error('api/call-to-action/User/callToAction/notAllowed')
    }

    return getCache(user.id, context).cache(() => {
      const now = new Date()

      return context.pgdb.public.callToActions.find(
        {
          userId: user.id,
          'beginAt <=': now,
          'endAt >': now,
          acknowledgedAt: null,
        },
        {
          orderBy: 'beginAt',
        },
      )
    })
  },
}
