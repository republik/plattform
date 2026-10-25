const { Roles } = require('@orbiting/backend-modules-auth')
const { hasUserActiveMembership } = require('@orbiting/backend-modules-utils')

/**
 * User can comment when they have the member role and either debater role or an active membership
 */
module.exports = async (discussion, _, context) => {
  const { closed } = discussion
  const { user, pgdb } = context

  // User can not comment, if discussion is closed
  if (closed) {
    return false
  }

  // User can comment, if user has member role and either debater role or an active membership
  const isMember = Roles.userIsInRoles(user, ['member'])
  const isDebater = Roles.userIsInRoles(user, ['debater'])
  const hasActiveMembership =
    !!user && (await hasUserActiveMembership(user, pgdb))

  return isMember && (isDebater || hasActiveMembership)
}
