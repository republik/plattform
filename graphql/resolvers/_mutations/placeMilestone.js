const { Roles: { ensureUserHasRole } } = require('backend-modules-auth')
const { createGithubClients } = require('../../../lib/github')

module.exports = async (
  _,
  { repoId, commitId, name: _name, message },
  { user, pubsub }
) => {
  ensureUserHasRole(user, 'editor')
  const { githubRest } = await createGithubClients()

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

  await pubsub.publish('repoUpdate', {
    repoUpdate: {
      id: repoId
    }
  })

  return {
    ...tag,
    name: tag.tag,
    date: tag.tagger.date,
    author: {
      ...tag.tagger
    },
    commit: {
      id: tag.object.sha,
      repo: {
        id: repoId
      }
    },
    repo: {
      id: repoId
    }
  }
}
