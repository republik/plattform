const { Roles } = require('@orbiting/backend-modules-auth')
const logger = console
const updateUser = require('../../../lib/updateUser')

module.exports = async (_, args, {pgdb, req, t}) => {
  Roles.ensureUserHasRole(req.user, 'supporter')
  const user = await pgdb.public.users.findOne({id: args.userId})
  if (!user) {
    logger.error('user not found', { req: req._log() })
    throw new Error(t('api/users/404'))
  }
  return updateUser(args, {
    user,
    pgdb,
    req,
    t
  })
}
