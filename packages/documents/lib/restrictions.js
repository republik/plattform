const {
  Roles: { userIsInRoles },
} = require('@orbiting/backend-modules-auth')

const {
  DOCUMENTS_RESTRICT_TO_ROLES,
  DOCUMENTS_UNRESTRICTED_CHILDREN_REPO_IDS,
} = process.env

const restrictToRoles = () =>
  (DOCUMENTS_RESTRICT_TO_ROLES || false) &&
  DOCUMENTS_RESTRICT_TO_ROLES.length &&
  DOCUMENTS_RESTRICT_TO_ROLES.split(',')

const isUserUnrestricted = (user) =>
  !restrictToRoles() || userIsInRoles(user, restrictToRoles())

const includesUnrestrictedChildRepoId = (repoIds) =>
  (repoIds || false) &&
  repoIds.length &&
  DOCUMENTS_UNRESTRICTED_CHILDREN_REPO_IDS &&
  DOCUMENTS_UNRESTRICTED_CHILDREN_REPO_IDS.split(',').some((repoId) =>
    repoIds.some((f) => new RegExp(`.*${repoId}$`).test(f)),
  )

module.exports = {
  restrictToRoles,
  isUserUnrestricted,
  includesUnrestrictedChildRepoId,
}
