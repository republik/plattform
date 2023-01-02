const meta = {
  common: require('./common/meta'),
  mdast: require('./mdast/meta'),
  slate: require('./slate/meta'),
}

const { getAudioCover, getWordsPerMinute, getRepoIdsForDoc, getTemplate } =
  meta.common

const getMeta = (doc) => {
  const getMeta = meta[doc.type || 'mdast']?.getMeta || meta.common?.getMeta

  if (!getMeta) {
    console.warn(`meta/getMeta for doc.type "${doc.type}" not implemented`)
    return
  }

  return getMeta(doc)
}

const getContributorUserLinks = (type, docMeta, { loaders }) => {
  const getContributorUserLinks =
    meta[type || 'mdast']?.getContributorUserLinks ||
    meta.common?.getContributorUserLinks

  if (!getContributorUserLinks) {
    console.warn(
      `meta/getContributorUserLinks for type "${type}" not implemented`,
    )
    return
  }

  return getContributorUserLinks(docMeta, { loaders })
}

const getContributorUserIds = (type, docMeta, context) => {
  const getContributorUserIds =
    meta[type || 'mdast']?.getContributorUserIds ||
    meta.common?.getContributorUserIds

  if (!getContributorUserIds) {
    console.warn(
      `meta/getContributorUserIds for type "${type}" not implemented`,
    )
    return
  }

  return getContributorUserIds(docMeta, context)
}

module.exports = {
  getAudioCover,
  getWordsPerMinute,
  getRepoIdsForDoc,
  getTemplate,

  getMeta,
  getContributorUserLinks,
  getContributorUserIds,
}
