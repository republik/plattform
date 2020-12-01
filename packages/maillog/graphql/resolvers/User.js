const { Roles } = require('@orbiting/backend-modules-auth')

const { paginate } = require('../../lib/paginate')

module.exports = {
  async mailLog(user, args, { pgdb, user: me }) {
    if (!Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter'])) {
      return null
    }

    const records = await pgdb.public.mailLog.find(
      {
        or: [{ userId: user.id }, { userId: null, email: user.email }],
      },
      { orderBy: { createdAt: 'DESC' } },
    )

    return paginate(records, args)
  },
}
