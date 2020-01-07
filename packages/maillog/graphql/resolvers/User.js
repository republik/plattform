const { Roles } = require('@orbiting/backend-modules-auth')
const { paginate: { paginator } } = require('@orbiting/backend-modules-utils')

module.exports = {
  async mailLog (user, args, { pgdb, user: me }) {
    if (!Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter'])) {
      return null
    }

    const records = await pgdb.public.mailLog.find({
      or: [
        { id: user.id },
        { email: user.email }
      ]
    }, { orderBy: { createdAt: 'DESC' } })

    return paginator({ first: 100, ...args }, a => a, () => records)
  }
}
