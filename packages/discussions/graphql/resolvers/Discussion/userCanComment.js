const { Roles } = require('@orbiting/backend-modules-auth')
const { hasUserActiveMembership } = require('@orbiting/backend-modules-utils')

module.exports = async ({ minInterval, id }, _, context) => {
  const { user, pgdb } = context

  const isMember = Roles.userIsInRoles(user, ['member'])
  const isDebater = Roles.userIsInRoles(user, ['debater'])
  const hasActiveMembership = !!user && await hasUserActiveMembership(user, pgdb)

  return isMember && (hasActiveMembership || isDebater)
}
