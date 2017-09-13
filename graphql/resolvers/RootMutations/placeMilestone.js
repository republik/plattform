const { githubRest } = require('../../../lib/github')
const { ensureUserHasRole } = require('../../../lib/Roles')

module.exports = async (
  _,
  { repoId, commitId, name: _name, message },
  { user }
) => {
  ensureUserHasRole(user, 'editor')

  const name = _name.replace(/\s/g, '-')

  const [login, repoName] = repoId.split('/')
  const tag = await githubRest.gitdata.createTag({
    owner: login,
    repo: repoName,
    tag: name,
    message,
    object: commitId,
    type: 'commit',
    tagger: user.gitAuthor()
  })
    .then(result => result.data)

  await githubRest.gitdata.createReference({
    owner: login,
    repo: repoName,
    ref: `refs/tags/${name}`,
    sha: tag.sha
  })

  return {
    ...tag,
    name: tag.tag,
    date: tag.tagger.date,
    author: {
      ...tag.tagger
    },
    commit: {
      id: tag.object.sha
    },
    repo: {
      id: repoId
    }
  }
}
