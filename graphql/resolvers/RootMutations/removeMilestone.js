const { githubRest } = require('../../../lib/github')
const { ensureUserHasRole } = require('../../../lib/Roles')

module.exports = async (
  _,
  { repoId, name },
  { user }
) => {
  ensureUserHasRole(user, 'editor')

  const [login, repoName] = repoId.split('/')
  return githubRest.gitdata.deleteReference({
    owner: login,
    repo: repoName,
    ref: `tags/${name}`
  })
}
