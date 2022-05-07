const {
  Roles: { userIsInRoles },
} = require('@orbiting/backend-modules-auth')

const {
  DOCUMENTS_RESTRICT_TO_ROLES,
  DOCUMENTS_UNRESTRICTED_CHILDREN_REPO_IDS,
  DOCUMENTS_API_KEYS,
} = process.env

let apiKeys = []
try {
  if (DOCUMENTS_API_KEYS) {
    apiKeys = JSON.parse(DOCUMENTS_API_KEYS)
  }
} catch (e) {
  console.error('DOCUMENTS_API_KEYS invalid', e)
}

const isValidApiKey = (key) => {
  return !!key && apiKeys.some((apiKey) => apiKey.key === key)
}

const restrictToRoles =
  !!DOCUMENTS_RESTRICT_TO_ROLES && DOCUMENTS_RESTRICT_TO_ROLES.split(',')

const isUserUnrestricted = (user) =>
  !restrictToRoles || userIsInRoles(user, restrictToRoles)

const includesUnrestrictedChildRepoId = (repoIds) =>
  (repoIds || false) &&
  repoIds.length &&
  DOCUMENTS_UNRESTRICTED_CHILDREN_REPO_IDS &&
  DOCUMENTS_UNRESTRICTED_CHILDREN_REPO_IDS.split(',').some((repoId) =>
    repoIds.some((f) => new RegExp(`.*${repoId}$`).test(f)),
  )

module.exports = {
  isValidApiKey,
  isUserUnrestricted,
  includesUnrestrictedChildRepoId,
}
