const { userHasRole } = require('../../../lib/Roles')

module.exports = async (_, args, { user, redis }) => {
  const userHasRoleEditor = userHasRole(user, 'editor')

  const listKey = userHasRoleEditor
    ? 'prepublishedRepoIds'
    : 'publishedRepoIds'

  const repoIds = await redis.zrangeAsync(listKey, 0, -1)

  return Promise.all(
    repoIds.map(repoId => {
      return redis.getAsync(`${repoId}/${userHasRoleEditor ? 'prepublication' : 'publication'}`)
    })
  )
    .then(docs =>
      docs.map(doc => JSON.parse(doc))
    )
}
