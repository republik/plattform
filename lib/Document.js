const editRepoMeta = require('../graphql/resolvers/_mutations/editRepoMeta')

const { timeFormat } = require('@orbiting/backend-modules-formats')
const slugDateFormat = timeFormat('%Y/%m/%d')

const getPath = (docMeta) => {
  const { slug, template, publishDate } = docMeta
  const cleanedSlug = slug.indexOf('/') > -1
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
  let publishDate = repoMeta.publishDate || new Date(docMeta.publishDate)
  if (!publishDate) {
    publishDate = scheduledAt || now
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

module.exports = {
  prepareMetaForPublish
}
