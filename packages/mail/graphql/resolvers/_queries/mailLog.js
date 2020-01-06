const { paginate: { paginator } } = require('@orbiting/backend-modules-utils')

const MAX_RECORDS = 1000

module.exports = async (_, args, { auth, pgdb, user: me }) => {
  auth.Roles.ensureUserIsInRoles(me, ['admin', 'supporter'])

  const records = await pgdb.public.mailLog.findAll({ orderBy: { createdAt: 'DESC' }, limit: MAX_RECORDS })

  return paginator({ first: 40, ...args }, a => a, () => records)
}
