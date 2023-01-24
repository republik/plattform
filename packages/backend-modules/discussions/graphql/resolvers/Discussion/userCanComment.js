const { Roles } = require('@orbiting/backend-modules-auth')
const { hasUserActiveMembership } = require('@orbiting/backend-modules-utils')

module.exports = async (discussion, _, context) => {
  const { closed } = discussion
  const { user, pgdb } = context

  if (closed) {
    return false
  }

  /* TODO: das geht aber noch besser, jetzt ist's so hin und her */
  const additionalAllowedRoles = discussion.allowedRoles.filter(
    (role) => !['member', 'debater'].includes(role),
  )
  const isInAllowedRoles =
    additionalAllowedRoles.length > 0 &&
    Roles.userIsInRoles(user, discussion.allowedRoles)

  const isMember = Roles.userIsInRoles(user, ['member'])
  if (!isMember && !isInAllowedRoles) {
    return false
  }

  const isDebater = Roles.userIsInRoles(user, ['debater'])
  const hasActiveMembership =
    !!user && (await hasUserActiveMembership(user, pgdb))

  return hasActiveMembership || isDebater || isInAllowedRoles
}
