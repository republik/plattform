const github = require('../../../lib/github')
const { ensureUserHasRole } = require('../../../lib/Roles')

module.exports = async (
  _,
  { repoId, name },
  { pgdb, req }
) => {
  ensureUserHasRole(req.user, 'editor')

  if (!req.user.githubAccessToken) {
    throw new Error('you need to sign in to github first')
  }

  return github.removeRef(
    req.user.githubAccessToken,
    repoId,
    `tags/${name}`
  )
}
