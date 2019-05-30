const transformUser = require('../../../lib/transformUser')
const { resolveUser } = require('../../../lib/Users')
const Roles = require('../../../lib/Roles')

module.exports = async (_, { slug }, { user: me, pgdb }) => {
  if (!slug) {
    return null
  }

  const user = await resolveUser({ slug, pgdb })

  if (user.deletedAt && !Roles.userIsInRoles(['admin', 'supporter'])) {
    return null
  }

  if (user && Roles.userIsMeOrProfileVisible(user, me)) {
    return transformUser(user)
  }

  return null
}
