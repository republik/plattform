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

  const credits = {
    type: 'slate',
    children: getCredits(doc),
  }

  doc._meta = {
    ...doc.content.meta,
    credits,
    /* credits: getCredits(doc),
    audioSource: getAudioSource(doc),
    ...times, */
    ...resolvedFields,
  }

  return doc._meta
}

const getContributors = (meta, context) => {
  /* // const creditsString = stringifyNode(meta.credits?.type, meta.credits)
  const creditsContributors = new Analyzer().getAnalysis(creditsString).contributors
  const metaContriburors = meta?.contributors || []

  console.log({
    creditsString,
    creditsContributors,
    metaContriburors,
  }) */

  return []
}

module.exports = {
  getCredits,
  getMeta,
  getContributors,
}
