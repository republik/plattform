const { publishMonitor } = require('../../../lib/slack')
const {
  ensureUserHasRole,
  userHasRole,
  addUserToRole,
  isRoleClaimableByMe,
} = require('../../../lib/Roles')

module.exports = async (_, args, { pgdb, loaders, user: me, req, t }) => {
  const { userId, role } = args
  const isMyself = !userId || me.id === userId

  if (!(isMyself && isRoleClaimableByMe(role, me))) {
    ensureUserHasRole(me, 'admin')
  }

  const user = isMyself ? me : await loaders.User.byId.load(userId)
  if (!user) {
    throw new Error(t('api/users/404'))
  }

  if (userHasRole(user, role)) {
    return user
  }

  await addUserToRole(user.id, role, pgdb)

  try {
    const { id, name, email } = user
    await publishMonitor(
      me,
      `:key: addUserToRole \`${role}\` ` +
        `on *<{ADMIN_FRONTEND_BASE_URL}/users/${id}|${name || email}>*`,
    )
  } catch (e) {
    // swallow slack message
    console.warn('publish to slack failed', { req: req._log(), args, error: e })
  }

  await loaders.User.byId.clear(user.id)
  return loaders.User.byId.load(user.id)
}
