const { ensureUserHasRole } = require('../../../lib/Roles')
const { createGithubClients } = require('../../../lib/github')

module.exports = async (
  _,
  { repoId, name },
  { user, pubsub }
) => {
  ensureUserHasRole(user, 'editor')
  const { githubRest } = await createGithubClients()

  const [login, repoName] = repoId.split('/')
  const result = await githubRest.gitdata.deleteReference({
    owner: login,
    repo: repoName,
    ref: `tags/${name}`
  })

  await pubsub.publish('repoUpdate', {
    repoUpdate: {
      id: repoId
    }
  })

  return result
}
