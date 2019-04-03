const { Roles: { ensureUserHasRole } } = require('@orbiting/backend-modules-auth')
const {
  getAnnotatedTag,
  createGithubClients,
  upsertRef,
  gitAuthor
} = require('../../../lib/github')
const yaml = require('../../../lib/yaml')
const { upsert: repoCacheUpsert } = require('../../../lib/cache/upsert')

const { latestCommit: getLatestCommit } = require('../Repo')

const TAG_NAME = 'meta'

module.exports = async (_, args, context) => {
  const { user, pubsub } = context
  ensureUserHasRole(user, 'editor')
  const { githubRest } = await createGithubClients()

  const {
    repoId,
    creationDeadline,
    productionDeadline,
    publishDate,
    briefingUrl,
    mailchimpCampaignId,
    discussionId
  } = args

  const tag = await getAnnotatedTag(
    repoId,
    TAG_NAME
  )

  const meta = {
    ...tag
      ? yaml.parse(tag.message)
      : {},
    ...(creationDeadline !== undefined && { creationDeadline }),
    ...(productionDeadline !== undefined && { productionDeadline }),
    ...(publishDate !== undefined && { publishDate }),
    ...(briefingUrl !== undefined && { briefingUrl }),
    ...(mailchimpCampaignId !== undefined && { mailchimpCampaignId }),
    ...(discussionId !== undefined && { discussionId })
  }
  const message = yaml.stringify(meta)

  const commitId = tag
    ? tag.commit.id
    : await getLatestCommit({ id: repoId }, null, context)
      .then(c => c.id)

  const [login, repoName] = repoId.split('/')
  const newTag = await githubRest.gitdata.createTag({
    owner: login,
    repo: repoName,
    tag: TAG_NAME,
    message,
    object: commitId,
    type: 'commit',
    tagger: gitAuthor(user)
  })
    .then(result => result.data)
    .catch(e => console.error(e))

  await upsertRef(
    repoId,
    `tags/${TAG_NAME}`,
    newTag.sha
  )

  await repoCacheUpsert({
    id: repoId,
    meta
  }, context)

  // pubsub not available if called by pullRedis
  if (pubsub) {
    await pubsub.publish('repoUpdate', {
      repoUpdate: {
        id: repoId
      }
    })
  }

  return {
    id: repoId,
    meta
  }
}
