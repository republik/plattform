const { userHasRole } = require('../../../lib/Roles')

module.exports = async (_, args, { user, redis }) => {
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
    )
}
