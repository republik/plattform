const dayjs = require('dayjs')

const { Roles } = require('@orbiting/backend-modules-auth')

const { getCache } = require('../../lib/cache')

module.exports = {
  callToActions: async (user, args, context) => {
    const { user: me, t } = context

    if (!Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter'])) {
      throw new Error(t('api/call-to-actions/notAllowed'))
    }

    return getCache(user.id, context).cache(async () => {
      const now = dayjs()

      return context.pgdb.public.callToActions.find(
        {
          userId: user.id,
          'beginAt <=': now,
          'endAt >': now,
        },
        { orderBy: 'beginAt' },
      )
    })
  },
}
