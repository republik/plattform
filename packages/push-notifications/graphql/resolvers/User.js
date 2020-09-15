const { Roles } = require('@orbiting/backend-modules-auth')
const userAccessRoles = ['admin', 'supporter']

module.exports = {
  async devices(user, args, { pgdb, user: me }) {
    Roles.ensureUserIsMeOrInRoles(user, me, userAccessRoles)
    return pgdb.public.devices.find({
      userId: me.id,
    })
  },
}
