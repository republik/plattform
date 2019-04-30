const debug = require('debug')('publikator:mutation:removeMilestone')
const { Roles: { ensureUserHasRole } } = require('@orbiting/backend-modules-auth')
const { createGithubClients } = require('../../../lib/github')
const { upsert: repoCacheUpsert } = require('../../../lib/cache/upsert')

module.exports = async (
  _,
  { repoId, name },
  context
) => {
  const { user, pubsub } = context
  ensureUserHasRole(user, 'editor')
  const { githubRest } = await createGithubClients()

  debug({ repoId, name })

  const [login, repoName] = repoId.split('/')
  await githubRest.gitdata.deleteRef({
    owner: login,
    repo: repoName,
    ref: `tags/${name}`
  })

  await pubsub.publish('repoUpdate', {
    repoUpdate: {
      id: repoId
    }
  })

  await repoCacheUpsert({
    id: repoId,
    tag: {
      action: 'remove',
      name
    }
  }, context)

  return true
}
