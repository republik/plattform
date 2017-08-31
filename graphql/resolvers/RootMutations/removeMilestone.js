const github = require('../../../lib/github')

module.exports = async (
  _,
  { repoId, name },
  { pgdb, req }
) => {
  if (!req.user) {
    throw new Error('you need to signIn first')
  }
  if (!req.user.githubAccessToken) {
    throw new Error('you need to sign in to github first')
  }

  return github.removeRef(
    req.user.githubAccessToken,
    repoId,
    `tags/${name}`
  )
}
