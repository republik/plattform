const { Roles } = require('@orbiting/backend-modules-auth')
const { hasUserActiveMembership } = require('@orbiting/backend-modules-utils')

module.exports = async (discussion, _, context) => {
  const { closed } = discussion
  const { user, pgdb } = context

  if (closed) {
    return false
  }

  const isMember = Roles.userIsInRoles(user, ['member'])
  if (!isMember) {
    return false
  }

  const isDebater = Roles.userIsInRoles(user, ['debater'])
  const hasActiveMembership =
    !!user && (await hasUserActiveMembership(user, pgdb))

  return hasActiveMembership || isDebater
}
