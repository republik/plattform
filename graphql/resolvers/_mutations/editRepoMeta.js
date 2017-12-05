const { Roles: { ensureUserHasRole } } = require('@orbiting/backend-modules-auth')
const {
  getAnnotatedTag,
  createGithubClients,
  upsertRef
} = require('../../../lib/github')
const yaml = require('../../../lib/yaml')

const { latestCommit: getLatestCommit } = require('../Repo')

const TAG_NAME = 'meta'

module.exports = async (_, args, { user, t, pubsub }) => {
  ensureUserHasRole(user, 'editor')
  const { githubRest } = await createGithubClients()

  const {
    repoId,
    creationDeadline,
    productionDeadline
  } = args

  const tag = await getAnnotatedTag(
    repoId,
    TAG_NAME
  )

  const message = yaml.stringify(
    {
      ...tag
        ? yaml.parse(tag.message)
        : {},
      ...(creationDeadline && { creationDeadline }),
      ...(productionDeadline && { productionDeadline })
    }
  )

  const commitId = tag
    ? tag.commit.id
    : await getLatestCommit({ id: repoId })
      .then(c => c.id)

  const [login, repoName] = repoId.split('/')
  const newTag = await githubRest.gitdata.createTag({
    owner: login,
    repo: repoName,
    tag: TAG_NAME,
    message,
    object: commitId,
    type: 'commit',
    tagger: user.gitAuthor()
  })
    .then(result => result.data)
    .catch(e => console.error(e))

  await upsertRef(
    repoId,
    `tags/${TAG_NAME}`,
    newTag.sha
  )

  await pubsub.publish('repoUpdate', {
    repoUpdate: {
      id: repoId
    }
  })

  return true
}
