const editRepoMeta = require('../graphql/resolvers/_mutations/editRepoMeta')
const { upsert: upsertDiscussion } = require('./Discussion')

const { timeFormat } = require('@orbiting/backend-modules-formats')
const slugDateFormat = timeFormat('%Y/%m/%d')

const getPath = (docMeta) => {
  const { slug, template, publishDate } = docMeta
  const cleanedSlug = slug && slug.indexOf('/') > -1
    ? new RegExp(/.*\/(.*)/g).exec(slug)[1] // ignore everything before the last /
    : slug
  switch (template) {
    case 'front':
      return `/${cleanedSlug || ''}`
    case 'dossier':
      return `/dossier/${cleanedSlug}`
    case 'format':
      return `/format/${cleanedSlug}`
    case 'discussion':
      return `/${slugDateFormat(publishDate)}/${cleanedSlug}/diskussion`
    default:
      return `/${slugDateFormat(publishDate)}/${cleanedSlug}`
  }
}

const prepareMetaForPublish = async (repoId, docMeta, repoMeta, scheduledAt, now = new Date(), context) => {
  let publishDate = repoMeta.publishDate
    ? new Date(repoMeta.publishDate)
    : null
  let savePublishDate
  if (!publishDate) {
    publishDate = docMeta.publishDate
      ? new Date(docMeta.publishDate)
      : new Date(scheduledAt || now)
    savePublishDate = true
  }

  const path = getPath({
    ...docMeta,
    publishDate
  })

  let discussionId
  if (docMeta.template === 'discussion') {
    discussionId = await upsertDiscussion(repoMeta, {...docMeta, path}, context)
  }

  if (savePublishDate || (discussionId && discussionId !== repoMeta.discussionId)) {
    await editRepoMeta(null, {
      repoId,
      ...savePublishDate
        ? { publishDate }
        : { },
      ...discussionId
        ? { discussionId }
        : { }
    }, context)
  }

  // transform docMeta
  return {
    ...docMeta,
    path,
    publishDate,
    discussionId
  }
}

const {
  Redirections: { upsert: upsertRedirection }
} = require('@orbiting/backend-modules-redirections')
const { document: getPublishedDocument } = require('../graphql/resolvers/Publication')

// if the requirements for context change you need to
// adapt lib/publicationScheduler
const handleRedirection = async (
  repoId,
  newDocMeta,
  context
) => {
  const publishedDoc = await getPublishedDocument({
    repo: { id: repoId },
    refName: 'publication'
  }, null, context)
  const scheduledDoc = await getPublishedDocument({
    repo: { id: repoId },
    refName: 'scheduled-publication'
  }, null, context)
  const docs = [publishedDoc, scheduledDoc].filter(Boolean)
  for (let doc of docs) {
    if (doc.content.meta.path !== newDocMeta.path) {
      await upsertRedirection({
        source: doc.content.meta.path,
        target: newDocMeta.path,
        resource: { repo: { id: repoId } }
      }, context)
    }
  }
}

module.exports = {
  prepareMetaForPublish,
  handleRedirection
}
