const { Roles } = require('@orbiting/backend-modules-auth')
const { transformUser } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, { pgdb, user }) => {
  const { id } = args
  const profileUser = await pgdb.public.users.findOne({ id })
    .then(user => transformUser(user))
  if (!profileUser) {
    return null
  }
  if (
    !profileUser.isPrivate ||
    Roles.userHasRole(user, 'supporter') ||
    Roles.userHasRole(user, 'admin')
  ) {
    const email = profileUser.isEmailPublic ? profileUser.email : null

    return {
      ...profileUser,
      email
    }
  }
}
