const { Roles } = require('@orbiting/backend-modules-auth')
const { hasUserActiveMembership } = require('@orbiting/backend-modules-utils')

const DEFAULT_ROLES = ['member']

module.exports = async (discussion, _, context) => {
  const { closed } = discussion
  const { user, pgdb } = context

  if (closed) {
    return false
  }

  const additionalAllowedRoles = discussion.allowedRoles.filter(
    (role) => ![DEFAULT_ROLES].includes(role),
  )
  const isInAllowedRoles =
    additionalAllowedRoles.length > 0 &&
    Roles.userIsInRoles(user, discussion.allowedRoles)

  if (isInAllowedRoles) {
    return true
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
