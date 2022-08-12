const visit = require('unist-util-visit')
const Promise = require('bluebird')
const { v4: isUuid } = require('is-uuid')

const { mdastToString } = require('@orbiting/backend-modules-utils')

const {
  getAudioSource,
  isReadingMinutesSuppressed,
  getEstimatedReadingMinutes,
  getEstimatedConsumptionMinutes,
} = require('../common/meta')
const { metaFieldResolver } = require('../common/resolve')

const { FRONTEND_BASE_URL } = process.env

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
const getMeta = (doc) => {
  // If {doc._meta} is present, this indicates meta information was retrieved
  // already.
  if (doc._meta) {
    return doc._meta
  }

  // see _all note in Document.content resolver
  const resolvedFields =
    doc._all || doc._usernames
      ? metaFieldResolver(doc.content.meta, doc._all, doc._usernames)
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
  doc._meta = {
    ...doc.content.meta,
    credits: {
      type: 'mdast',
      children: getCredits(doc),
    },
    audioSource: getAudioSource(doc),
    ...times,
    ...resolvedFields,
  }

  return doc._meta
}

const getContributorUserLinks = (meta, { loaders }) => {
  const { contributorUserLinks, credits, path } = meta
  if (contributorUserLinks) {
    // computed on publish
    return Promise.resolve(contributorUserLinks)
  }
  return Promise.map(
    credits.children?.filter((c) => c.type === 'link'),
    async (node) => {
      let { url } = node
      if (url.startsWith(FRONTEND_BASE_URL)) {
        url = url.replace(FRONTEND_BASE_URL, '')
      }
      const name = mdastToString(node).trim()
      if (url.startsWith('/~')) {
        const idOrUsername = url.substring(2)
        if (isUuid(idOrUsername)) {
          return {
            id: idOrUsername,
            name,
          }
        } else {
          return loaders.User.byUsername.load(idOrUsername).then((u) => {
            if (!u) {
              console.warn(
                `linked contributor username not found: ${name} url=${url} path=${path}`,
              )
              return
            }
            return {
              id: u.id,
              name,
            }
          })
        }
      } else {
        console.warn(`unkown contributor link: ${name} url=${url} path=${path}`)
      }
    },
  ).then((userLinks) => {
    meta.contributorUserLinks = userLinks.filter(Boolean)
    return meta.contributorUserLinks
  })
}

const getContributorUserIds = (meta, context) =>
  (meta.authorUserIds && Promise.resolve(meta.authorUserIds)) || // legacy in redis and elastic search caches
  getContributorUserLinks(meta, context).then((userLinks) =>
    userLinks.map((userLink) => userLink.id),
  )

module.exports = {
  getCredits,
  getMeta,
  getContributorUserIds,
  getContributorUserLinks,
}
