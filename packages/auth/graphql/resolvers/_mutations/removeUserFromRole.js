const t = require('../../../lib/t')
const {
  ensureUserHasRole,
  userHasRole,
  removeUserFromRole
} = require('../../../lib/Roles')

const logger = console

module.exports = async (_, args, { pgdb, req, signInHooks }) => {
  ensureUserHasRole(req.user, 'admin')

  const { userId, role } = args

  const user = await pgdb.public.users.findOne({id: userId})

  if (!user) {
    logger.error('user not found', { req: req._log() })
    throw new Error(t('api/users/404'))
  }

  if (!userHasRole(user, role)) {
    return user
  } else {
    return removeUserFromRole(userId, role, pgdb)
  }
}
