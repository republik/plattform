const { Roles } = require('@orbiting/backend-modules-auth')
const userAccessRoles = ['admin', 'supporter']
const { transformUser } = require('@orbiting/backend-modules-auth')

module.exports = {
  async user(device, args, { pgdb, user: me }) {
    const user = await pgdb.public.users
      .findOne({
        id: device.userId,
      })
      .then((user) => transformUser(user))
    Roles.ensureUserIsMeOrInRoles(user, me, userAccessRoles)
    return user
  },
  lastSeen(device) {
    return device.updatedAt
  },
}
