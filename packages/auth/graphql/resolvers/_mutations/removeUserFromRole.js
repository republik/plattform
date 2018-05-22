const t = require('../../../lib/t')
const transformUser = require('../../../lib/transformUser')

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

  const returnedUser = !userHasRole(user, role) ? user : (await removeUserFromRole(userId, role, pgdb))
  return transformUser(returnedUser)
}
