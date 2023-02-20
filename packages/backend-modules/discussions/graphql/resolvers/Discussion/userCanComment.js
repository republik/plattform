const { Roles } = require('@orbiting/backend-modules-auth')
const { hasUserActiveMembership } = require('@orbiting/backend-modules-utils')

/**
 * User can comment when either:
 * - a) they have a role which is allowed to comment (discussion.allowedRoles)
 * - b) they have the member role and either debater role or an active membership
 */
module.exports = async (discussion, _, context) => {
  const { closed } = discussion
  const { user, pgdb } = context

  // User can not comment, if discussion is closed
  if (closed) {
    return false
  }

  // a) User can comment, if it has some of the allowed roles but member
  const allowedRoles = discussion.allowedRoles.filter((r) => r !== 'member')
  if (Roles.userIsInRoles(user, allowedRoles)) {
    return true
  }

  // b) User can comment, if discussion allows member role, user has member role
  // and either debater role or an active membership.
  const isMemberAllowed = !!discussion.allowedRoles.find((r) => r === 'member')
  const isMember = Roles.userIsInRoles(user, ['member'])
  const isDebater = Roles.userIsInRoles(user, ['debater'])
  const hasActiveMembership =
    !!user && (await hasUserActiveMembership(user, pgdb))

  return isMemberAllowed && isMember && (isDebater || hasActiveMembership)
}
