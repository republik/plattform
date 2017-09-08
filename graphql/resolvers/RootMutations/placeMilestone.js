const { githubRest } = require('../../../lib/github')
const { ensureUserHasRole } = require('../../../lib/Roles')

module.exports = async (
  _,
  { repoId, commitId, name, message },
  { user }
) => {
  ensureUserHasRole(user, 'editor')

  const [login, repoName] = repoId.split('/')
  const tag = await githubRest.gitdata.createTag({
    owner: login,
    repo: repoName,
    tag: name,
    message,
    object: commitId,
    type: 'commit',
    tagger: {
      name: user.email, // TODO
      email: user.email,
      date: new Date()
    }
  })
    .then(result => result.data)

  await githubRest.gitdata.createReference({
    owner: login,
    repo: repoName,
    ref: `refs/tags/${name}`,
    sha: tag.sha
  })

  return {
    name: tag.tag,
    message: tag.message,
    commit: {
      id: tag.object.sha
    },
    author: {
      name: tag.tagger.name,
      email: tag.tagger.email
    },
    repo: {
      id: repoId
    }
  }
}
