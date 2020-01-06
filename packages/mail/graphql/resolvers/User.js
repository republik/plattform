const { paginate: { paginator } } = require('@orbiting/backend-modules-utils')

module.exports = {
  async mailLog (user, args, { auth: { Roles }, pgdb, user: me }) {
    if (!Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter'])) {
      return null
    }

    const records = await pgdb.public.mailLog.find({
      or: [
        { id: user.id },
        { email: user.email }
      ]
    }, { orderBy: { createdAt: 'DESC' } })

    return paginator({ first: 40, ...args }, a => a, () => records)
  }
}
