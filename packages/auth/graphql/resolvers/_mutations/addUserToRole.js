const t = require('../../../lib/t')
const transformUser = require('../../../lib/transformUser')

const {
  ensureUserHasRole,
  userHasRole,
  addUserToRole,
  isRoleClaimableByMe
} = require('../../../lib/Roles')

module.exports = async (_, args, { pgdb, signInHooks, user: me }) => {
  const {
    userId = me && me.id,
    role
  } = args

  if (!(me && me.id === userId && isRoleClaimableByMe(role, me))) {
    ensureUserHasRole(me, 'admin')
  }

  const user = await pgdb.public.users.findOne({ id: userId })
  if (!user) {
    throw new Error(t('api/users/404'))
  }

  const returnedUser = userHasRole(user, role)
    ? user
    : (await addUserToRole(userId, role, pgdb))

  return transformUser(returnedUser)
}
