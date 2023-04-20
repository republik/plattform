const visit = require('unist-util-visit')
const { v4: isUuid } = require('is-uuid')

const {
  Analyzer,
} = require('@orbiting/backend-modules-statistics/lib/credits/analyzer')

const {
  getAudioSource,
  isReadingMinutesSuppressed,
  getEstimatedReadingMinutes,
  getEstimatedConsumptionMinutes,
} = require('../common/meta')
const { metaFieldResolver } = require('../common/resolve')

const { stringifyNode } = require('./resolve')

/**
 * Obtain credits from either {doc.content.children} or {doc.meta}.
 *
 * @param  {Object} doc An MDAST tree
 * @return {Array}      MDAST children
 */
const getCredits = (doc) => {
  // If {doc.content} is available, always obtain credits from it.
  if (doc.content?.children) {
    let credits = []

    visit(doc.content, 'zone', (node) => {
      if (node.identifier === 'TITLE') {
        const paragraphs = node.children.filter(
          (child) => child.type === 'paragraph',
        )
        if (paragraphs.length >= 2) {
          credits = paragraphs[paragraphs.length - 1].children
        }
      }
    })

    return credits
  }

  // Due to perfomance considerations a {doc} might come in without
  // {doc.content}, or only {doc.content.meta} without credits is provided (to
  // resolve). In such a case, we look for {doc.meta.credits} to obtain credits.
  return doc.meta?.credits?.children || []
}

/**
 * Prepares meta information and resolves linked documents in meta which are
 * not available in original {doc.content.meta} fields.
 *
 * @param  {Object}      doc An MDAST tree
 * @return {Object|null}     e.g. { audioSource: null, auto: true, [...] }
 */
const getMeta = async (doc) => {
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

  const times = {
    estimatedReadingMinutes: null,
    estimatedConsumptionMinutes: null,
  }

  if (!isReadingMinutesSuppressed(doc.content.meta, resolvedFields)) {
    times.estimatedReadingMinutes = getEstimatedReadingMinutes(doc)
    times.estimatedConsumptionMinutes = getEstimatedConsumptionMinutes(
      doc,
      times.estimatedReadingMinutes,
    )
  }

  // Populate {doc._meta}. Is used to recognize provided {doc} for which meta
  // information was retrieved already.

  const credits = {
    type: 'mdast',
    children: getCredits(doc),
  }

  doc._meta = {
    ...doc.content.meta,
    ...times,
    ...resolvedFields,
    credits,
    creditsString: await stringifyNode(credits),
    audioSource: getAudioSource(doc),
  }

  doc._meta.contributors = getContributors(doc._meta)

  return doc._meta
}

const toContributor = (node) => {
  const contributor = {
    name: stringifyNode(node),
  }

  const identifier = node.url?.startsWith('/~') && node.url.replace(/^\/~/, '')

  if (identifier && isUuid(identifier)) {
    contributor.userId = identifier
  }

  return contributor
}

const getContributors = (meta) => {
  const creditsContributors =
    meta?.credits?.children
      ?.filter((c) => c.type === 'link')
      .map(toContributor)
      .filter(Boolean) || []

  const creditsString = stringifyNode(meta.credits)
  const creditsStringContributors =
    new Analyzer().getAnalysis(creditsString).contributors || []

  const metaContributors = meta?.contributors || []

  const contributors = [
    ...creditsContributors,
    ...creditsStringContributors,
    ...metaContributors,
  ].reduce((contributors, potentialContributor) => {
    const sameAtIndex = contributors?.findIndex(
      (contributor) =>
        contributor.name === potentialContributor.name &&
        (!contributor.kind || contributor.kind === potentialContributor.kind),
    )

    if (sameAtIndex < 0) {
      contributors.push(potentialContributor)
    } else {
      contributors[sameAtIndex] = {
        ...potentialContributor,
        ...contributors[sameAtIndex],
      }
    }

    return contributors
  }, [])

  return contributors
}

module.exports = {
  getMeta,
  getContributors,
}
