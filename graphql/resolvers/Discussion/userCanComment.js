const { Roles } = require('@orbiting/backend-modules-auth')

module.exports = async ({ minInterval, id }, _, { pgdb, user }) => {
  return Roles.userIsInRoles(user, ['member'])
}
