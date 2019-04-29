const debug = require('debug')('publikator:mutation:placeMilestone')
const { Roles: { ensureUserHasRole } } = require('@orbiting/backend-modules-auth')
const {
  createGithubClients,
  gitAuthor
} = require('../../../lib/github')
const { upsert: repoCacheUpsert } = require('../../../lib/cache/upsert')

module.exports = async (
  _,
  { repoId, commitId, name: _name, message },
  context
) => {
  const { user, pubsub } = context
  ensureUserHasRole(user, 'editor')
  const { githubRest } = await createGithubClients()

  const name = _name.replace(/\s/g, '-')

  debug({ repoId, commitId, name, message })

  const [login, repoName] = repoId.split('/')
  const tag = await githubRest.gitdata.createTag({
    owner: login,
    repo: repoName,
    tag: name,
    message,
    object: commitId,
    type: 'commit',
    tagger: gitAuthor(user)
  })
    .then(result => result.data)

  await githubRest.gitdata.createRef({
    owner: login,
    repo: repoName,
    ref: `refs/tags/${name}`,
    sha: tag.sha
  })

  await repoCacheUpsert({
    id: repoId,
    tag: {
      action: 'add',
      name
    }
  }, context)

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
