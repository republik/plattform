const t = require('../../../lib/t')
const transformUser = require('../../../lib/transformUser')

const {
  ensureUserHasRole,
  userHasRole,
  removeUserFromRole,
  isRoleClaimableByMe,
} = require('../../../lib/Roles')

module.exports = async (_, args, { pgdb, signInHooks, user: me }) => {
  const { userId = me && me.id, role } = args

  if (!(me && me.id === userId && isRoleClaimableByMe(role, me))) {
    ensureUserHasRole(me, 'admin')
  }

  const user =
    me.id !== userId ? await pgdb.public.users.findOne({ id: userId }) : me
  if (!user) {
    throw new Error(t('api/users/404'))
  }

  if (!userHasRole(user, role)) {
    return user
  }

  return removeUserFromRole(user.id, role, pgdb).then(transformUser)
}
