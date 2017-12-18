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
  const {
    feed,
    userId
  } = args

  return Promise.all(
    repoIds.map(repoId => {
      return redis.getAsync(`repos:${repoId}/${ref}`)
    })
  )
    .then(publications => {
      let documents = publications
        .filter(Boolean)
        .map(publication => JSON.parse(publication).doc)
      if (feed) {
        documents = documents.filter(d => (
          d.meta.feed ||
          (d.meta.feed === undefined && d.meta.template === 'article')
        ))
      }
      if (userId) {
        documents = documents.filter(d => {
          const userIds = (d.meta.credits || [])
            .filter(c => c.type === 'link')
            .map(c => c.url.split('~')[1])
            .filter(Boolean)
          return userIds.includes(userId)
        })
      }

      return documents.sort((a, b) =>
        descending(new Date(a.meta.publishDate), new Date(b.meta.publishDate))
      )
    })
}
