const { publishMonitor } = require('../../../lib/slack')
const {
  ensureUserHasRole,
  userHasRole,
  removeUserFromRole,
  isRoleClaimableByMe,
} = require('../../../lib/Roles')

module.exports = async (_, args, context) => {
  const { pgdb, loaders, user: me, req, t } = context
  const { userId, role } = args
  const isMyself = !userId || me.id === userId

  if (!(isMyself && isRoleClaimableByMe(role, me))) {
    ensureUserHasRole(me, 'admin')
  }

  const user = isMyself ? me : await loaders.User.byId.load(userId)
  if (!user) {
    throw new Error(t('api/users/404'))
  }

  if (!userHasRole(user, role)) {
    return user
  }

  await removeUserFromRole(user.id, role, pgdb)

  try {
    const { id, name, email } = user
    await publishMonitor(
      me,
      `:key: removeUserFromRole \`${role}\` ` +
        `from *<{ADMIN_FRONTEND_BASE_URL}/users/${id}|${name || email}>*`,
    )
  } catch (e) {
    // swallow slack message
    context.logger.warn({ args, error: e }, 'publish to slack failed')
  }

  await loaders.User.byId.clear(user.id)
  return loaders.User.byId.load(user.id)
}
