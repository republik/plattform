const { descending } = require('d3-array')
const {
  Roles: {
    userHasRole,
    ensureUserIsInRoles
  }
} = require('@orbiting/backend-modules-auth')

const {
  DOCUMENTS_RESTRICT_TO_ROLES
} = process.env

module.exports = async (_, args, { user, redis }) => {
  if (DOCUMENTS_RESTRICT_TO_ROLES) {
    const roles = DOCUMENTS_RESTRICT_TO_ROLES.split(',')
    ensureUserIsInRoles(user, roles)
  }

  const ref = userHasRole(user, 'editor')
    ? 'prepublication'
    : 'publication'

  const repoIds = await redis.smembersAsync('repos:ids')

  return Promise.all(
    repoIds.map(repoId => {
      return redis.getAsync(`repos:${repoId}/${ref}`)
    })
  )
    .then(publications => publications
      .filter(Boolean)
      .map(publication => JSON.parse(publication).doc)
      .sort((a, b) => descending(new Date(a.meta.publishDate), new Date(b.meta.publishDate)))
    )
}
