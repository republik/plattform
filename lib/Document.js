const editRepoMeta = require('../graphql/resolvers/_mutations/editRepoMeta')

const moment = require('moment')
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
  let publishDate = repoMeta.publishDate && moment(repoMeta.publishDate).isBefore(moment(now))
    ? new Date(repoMeta.publishDate)
    : null
  const savePublishDate = !publishDate
  if (!publishDate) {
    publishDate = docMeta.publishDate && moment(docMeta.publishDate).isBefore(moment(now))
      ? docMeta.publishDate
      : null
  }
  if (savePublishDate) {
    publishDate = new Date(publishDate || scheduledAt || now)
    if (context) {
      await editRepoMeta(null, {
        repoId,
        publishDate
      }, context)
    }
  }

  // transform docMeta
  return {
    ...docMeta,
    path: getPath({
      ...docMeta,
      publishDate
    }),
    publishDate
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
  if (
    publishedDoc &&
    publishedDoc.content.meta.path !== newDocMeta.path
  ) {
    await upsertRedirection({
      source: publishedDoc.content.meta.path,
      target: newDocMeta.path,
      resource: { repo: { id: repoId } }
    }, context)
  }
}

module.exports = {
  prepareMetaForPublish,
  handleRedirection
}
