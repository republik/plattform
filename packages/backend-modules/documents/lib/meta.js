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

const getContributors = (type, docMeta) => {
  const getContributors =
    meta[type || 'mdast']?.getContributors || meta.common?.getContributors

  if (!getContributors) {
    console.warn(`meta/getContributors for type "${type}" not implemented`)
    return
  }

  return getContributors(docMeta)
}

module.exports = {
  getAudioCover,
  getWordsPerMinute,
  getRepoIdsForDoc,
  getTemplate,

  getMeta,
  getContributors,
}
