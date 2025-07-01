const checkEnv = require('check-env')
const visit = require('unist-util-visit')
const { v4: isUuid } = require('is-uuid')
const compact = require('lodash/compact')

const { mdastToString } = require('@orbiting/backend-modules-utils')

const { hasFullDocumentAccess } = require('../restrictions')
const {
  createResolver,
  createUrlReplacer,
  getRepoId,
  extractUserUrl,
  shouldStripDocLinks,
} = require('../common/resolve')

checkEnv(['FRONTEND_BASE_URL'])

const contentUrlResolver = (
  doc,
  _all = [],
  _users = [],
  errors,
  urlPrefix,
  searchString,
  user,
) => {
  const docResolver = createResolver(_all, _users, errors)

  const urlReplacer = createUrlReplacer(
    _all,
    _users,
    errors,
    urlPrefix,
    searchString,
  )

  const stripDocLinks = shouldStripDocLinks(user, doc)

  visit(doc.content, 'link', (node) => {
    node.url = urlReplacer(node.url, stripDocLinks)
  })
  visit(doc.content, 'zone', (node) => {
    if (node.data) {
      const linkedDoc = docResolver(node.data.url)
      if (linkedDoc) {
        // this is used for the overview page
        // - assigns a publishDate to an teaser
        // - highlights all teasers of a format or series
        const {
          audioSourceKind,
          audioSourceMp3,
          audioSourceAac,
          audioSourceOgg,
        } = linkedDoc.meta
        const hasAudio =
          audioSourceMp3 ||
          audioSourceAac ||
          audioSourceOgg ||
          !linkedDoc.meta.suppressSyntheticReadAloud
        node.data.urlMeta = {
          documentId: linkedDoc.id,
          hasAudio,
          audioSourceKind: hasAudio && audioSourceKind,
          repoId: linkedDoc.meta.repoId,
          publishDate: linkedDoc.meta.publishDate,
          section:
            linkedDoc.meta.template === 'section'
              ? linkedDoc.meta.repoId
              : getRepoId(linkedDoc.meta.section).repoId,
          format:
            linkedDoc.meta.template === 'format'
              ? linkedDoc.meta.repoId
              : getRepoId(linkedDoc.meta.format).repoId,
          series: linkedDoc.meta.series
            ? typeof linkedDoc.meta.series === 'string'
              ? getRepoId(linkedDoc.meta.series).repoId
              : linkedDoc.meta.repoId
            : undefined,
        }
      }
      node.data.url = urlReplacer(node.data.url, stripDocLinks)
      node.data.formatUrl = urlReplacer(node.data.formatUrl, stripDocLinks)
    }
  })

  // Prevent memo node to be exposed
  visit(doc.content, 'span', (node, index, parent) => {
    if (node.data?.type === 'MEMO') {
      // Unwrap node.children into parent.children
      const { children = [] } = node
      parent.children = [
        ...parent.children.slice(0, index),
        ...children,
        ...parent.children.slice(index + 1),
      ]
    }
  })
}

const contentUserResolver = (content, _users = []) => {
  return Promise.resolve()
}

const metaUrlResolver = (
  meta,
  _all,
  _users,
  errors,
  urlPrefix,
  searchString,
  user,
  apiKey,
) => {
  const urlReplacer = createUrlReplacer(
    _all,
    _users,
    errors,
    urlPrefix,
    searchString,
  )

  meta.series?.episodes?.forEach((episode, index) => {
    if (
      index <= 1 ||
      !episode.document?.meta?.path ||
      episode.document.meta.path === meta.path ||
      user === undefined ||
      hasFullDocumentAccess(user, apiKey)
    ) {
      return
    }

    episode.document = undefined
  })

  meta?.credits?.children
    ?.filter((child) => child.type === 'link')
    .forEach((child) => {
      child.url = urlReplacer(child.url)
    })

  if (user === undefined || !hasFullDocumentAccess(user, apiKey)) {
    meta.recommendations = null
  }
}

const extractIdsFromNode = (node, contextRepoId) => {
  const repos = []
  const users = []
  visit(node, 'zone', (node) => {
    if (node.data) {
      repos.push(getRepoId(node.data.url).repoId)
      repos.push(getRepoId(node.data.formatUrl).repoId)
    }
  })
  visit(node, 'link', (node) => {
    const info = extractUserUrl(node.url)
    if (info) {
      if (isUuid(info.id)) {
        users.push(info.id)
      }
    }
    const { repoId } = getRepoId(node.url, 'autoSlug')
    if (repoId) {
      repos.push(repoId)
    }
  })
  return {
    repos: repos.filter(Boolean),
    users: users.filter(Boolean),
  }
}

/**
 * A filter to remove nodes from an mdast with a predicate. Will remove a node
 * if returns false.
 *
 * @param  {Object}   node        mdast Object
 * @param  {Function} [predicate] Predicate function, receives node as argument
 * @return {Object}               Filtered mdast Object
 */
const mdastFilter = function (node, predicate = () => true) {
  // Return null if predicate is false.
  if (!predicate(node)) {
    return null
  }

  // Return leaf if leaf has no children
  if (!node.children) {
    return node
  }

  // Return leaf with children, again filtered with predicate
  return {
    ...node,
    children: compact(
      node.children.map((child) => {
        return mdastFilter(child, predicate)
      }),
    ),
  }
}

const stringifyNode = (node) =>
  mdastToString(
    mdastFilter(
      node,
      (node) =>
        node.type !== 'code' &&
        ![
          'TITLE',
          'ARTICLECOLLECTION',
          'INFOBOX',
          'FIGURE',
          'NOTE',
          'HTML',
        ].includes(node.identifier),
    ),
    '\n',
  )
    .replace(/\u00AD/g, '') // 0x00AD = Soft Hyphen (SHY)
    .trim()

module.exports = {
  contentUrlResolver,
  contentUserResolver,
  metaUrlResolver,
  extractIdsFromNode,
  stringifyNode,
}
