const github = require('../../../lib/github')

module.exports = async (
  _,
  { repoId, commitId, name, message },
  { pgdb, req }
) => {
  if (!req.user) {
    throw new Error('you need to signIn first')
  }
  if (!req.user.githubAccessToken) {
    throw new Error('you need to sign in to github first')
  }

  const tag = await github.tag(
    req.user,
    repoId,
    name,
    message,
    commitId
  )

  await github.createRef(
    req.user.githubAccessToken,
    repoId,
    `refs/tags/${name}`,
    tag.sha
  )

  return {
    name: tag.tag,
    message: tag.message,
    commit: {
      id: tag.object.sha
    },
    author: {
      name: tag.tagger.name,
      email: tag.tagger.email
    }
  }
}
