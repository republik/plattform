const { Roles } = require('@orbiting/backend-modules-auth')
const { paginate: { paginator } } = require('@orbiting/backend-modules-utils')

const MAX_RECORDS = 5000

module.exports = async (_, args, { pgdb, user: me }) => {
  Roles.ensureUserIsInRoles(me, ['admin', 'supporter'])

  const records = await pgdb.public.mailLog.findAll({ orderBy: { createdAt: 'DESC' }, limit: MAX_RECORDS })

  return paginator({ first: 100, ...args }, a => a, () => records)
}
