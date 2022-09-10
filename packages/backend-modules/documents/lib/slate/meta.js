const { metaFieldResolver } = require('../common/resolve')

const getCredits = (doc) => {
  // @TODO: adopt for slate version
  // If {doc.content} is available, always obtain credits from it.
  return []

  // Due to perfomance considerations a {doc} might come in without
  // {doc.content}, or only {doc.content.meta} without credits is provided (to
  // resolve). In such a case, we look for {doc.meta.credits} to obtain credits.
  // return doc.meta?.credits?.children || []
}

const getMeta = (doc) => {
  // @TODO: adopt for slate version

  // If {doc._meta} is present, this indicates meta information was retrieved
  // already.
  if (doc._meta) {
    return doc._meta
  }

  // see _all note in Document.content resolver
  const resolvedFields =
    doc._all || doc._users
      ? metaFieldResolver(doc.content.meta, doc._all, doc._users)
      : {}

  /* const times = {
    estimatedReadingMinutes: null,
    estimatedConsumptionMinutes: null,
  }

  if (!isReadingMinutesSuppressed(doc.content.meta, resolvedFields)) {
    times.estimatedReadingMinutes = getEstimatedReadingMinutes(doc)
    times.estimatedConsumptionMinutes = getEstimatedConsumptionMinutes(
      doc,
      times.estimatedReadingMinutes,
    )
  } */

  // Populate {doc._meta}. Is used to recognize provided {doc} for which meta
  // information was retrieved already.
  doc._meta = {
    ...doc.content.meta,
    credits: {
      type: 'slate',
      children: getCredits(doc),
    },
    /* credits: getCredits(doc),
    audioSource: getAudioSource(doc),
    ...times, */
    ...resolvedFields,
  }

  return doc._meta
}

const getContributorUserIds = (meta, context) =>
  (meta.authorUserIds && Promise.resolve(meta.authorUserIds)) || // legacy in redis and elastic search caches
  getContributorUserLinks(meta, context).then((userLinks) =>
    userLinks.map((userLink) => userLink.id),
  )

const getContributorUserLinks = (meta, { loaders }) => {
  const { contributorUserLinks } = meta
  if (contributorUserLinks) {
    // computed on publish
    return Promise.resolve(contributorUserLinks)
  }
  return Promise.resolve([])
}

module.exports = {
  getCredits,
  getMeta,
  getContributorUserIds,
  getContributorUserLinks,
}
