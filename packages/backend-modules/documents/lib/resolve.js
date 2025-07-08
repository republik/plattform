const checkEnv = require('check-env')
const visit = require('unist-util-visit')
const { v4: isUuid } = require('is-uuid')
const compact = require('lodash/compact')

const { mdastToString } = require('@orbiting/backend-modules-utils')

const { hasFullDocumentAccess } = require('./restrictions')

checkEnv(['FRONTEND_BASE_URL'])

const {
  GITHUB_LOGIN,
  GITHUB_ORGS = GITHUB_LOGIN,
  FRONTEND_BASE_URL,
} = process.env

const PUBLIC_HOSTNAME = new URL(FRONTEND_BASE_URL).hostname

const getRepoId = (url, requireQuery) => {
  checkEnv(['GITHUB_LOGIN'])

  if (!url) {
    return {}
  }

  const parsedUrl = new URL(String(url), FRONTEND_BASE_URL)
  const { hostname, pathname } = parsedUrl

  if (!pathname) {
    // empty for mailto
    return { parsedUrl }
  }

  const pathSegments = pathname.split('/').filter(Boolean)
  if (
    hostname !== 'github.com' ||
    pathSegments.length !== 2 ||
    !GITHUB_ORGS.split(',').includes(pathSegments[0])
  ) {
    return { parsedUrl }
  }

  if (requireQuery && !parsedUrl.searchParams.has(requireQuery)) {
    return { parsedUrl }
  }

  // Remove {requireQuery} key-value from {parsedUrl.searchParams}.
  // Value should not be propagated, as this fn acted on it.
  parsedUrl.searchParams.delete(requireQuery)

  pathSegments[0] = GITHUB_LOGIN

  return { repoId: pathSegments.join('/'), parsedUrl }
}

const userPath = /^\/~([^/?#]+)/

const extractUserPath = (path) => {
  if (!path) {
    return
  }
  const match = String(path).match(userPath)
  const id = match && match[1]
  if (id) {
    return {
      id,
      path,
    }
  }
}

const extractUserUrl = (url) => {
  if (!url) {
    return
  }
  const urlObject = new URL(String(url), FRONTEND_BASE_URL)
  if (urlObject.hostname && urlObject.hostname !== PUBLIC_HOSTNAME) {
    // do nothing if url has a hostname and it's not ours
    return
  }
  return extractUserPath(
    `${urlObject.pathname}${urlObject.search}${urlObject.hash}`,
  )
}

const createUrlReplacer =
  (_all = [], _users = [], errors = [], urlPrefix = '', searchString = '') =>
  (url, stripDocLinks) => {
    const userInfo = extractUserPath(url)
    if (userInfo) {
      const user = _users.find((u) => u.id === userInfo.id)
      if (user) {
        return [
          urlPrefix,
          userInfo.path.replace(user.id, user.username),
          searchString,
        ].join('')
      }
    }

    const { repoId, parsedUrl } = getRepoId(url, 'autoSlug')
    // {url} lacks {repoId} and is nothing to resolve further.
    if (!repoId) {
      return url
    }

    // Return early if {stripDocLinks} argument is set as nothing has to be resolved.
    if (stripDocLinks) {
      return ''
    }

    const linkedDoc = _all.find((d) => d.meta.repoId === repoId)

    if (linkedDoc) {
      const baseUrl = urlPrefix || ''

      // Stitch and parse simple URL version including arguments {urlPrefix}, {searchString}
      const resolvedUrl = new URL(
        `${baseUrl}${linkedDoc.content.meta.path}${searchString}`,
        FRONTEND_BASE_URL,
      )

      // Replace {parsedUrl.hash} with {resolvedUrl.hash}
      resolvedUrl.hash = parsedUrl.hash

      // Merge {parsedUrl.searchParams} into {resolvedUrl.searchParams}
      // parsedUrl overwrites same keys in resolvedUrl.
      // resolvedUrl may contain searchParams from parsed {searchString}.
      parsedUrl.searchParams.forEach((value, name) =>
        resolvedUrl.searchParams.set(name, value),
      )

      // If {urlPrefix} is set, return stringified {resolvedUrl}.
      if (urlPrefix) {
        return resolvedUrl.toString()
      }

      // Strip {FRONTEND_BASE_URL} to return relative URLs.
      return resolvedUrl
        .toString()
        .replace(new RegExp(`^${FRONTEND_BASE_URL}`), '')
    } else {
      errors.push(repoId)
    }

    // autoSlug links pointing to not published or missing documents are stripped
    return ''
  }

const createResolver =
  (_all, _users, errors = []) =>
  (url) => {
    const { repoId } = getRepoId(url)
    if (!repoId) {
      return null
    }

    const linkedDoc = _all?.find((d) => d.meta.repoId === repoId)
    if (linkedDoc) {
      return {
        ...linkedDoc,
        _all,
        _users,
      }
    }

    errors.push(repoId)
    return null
  }

const metaFieldResolver = (meta, _all = [], _users = [], errors) => {
  const resolver = createResolver(_all, _users, errors)

  const format = resolver(meta.format)

  const ownPaynotes = meta.paynotes?.filter((p) => !p.inherit)
  const formatPaynotes = format?.meta.paynotes?.filter((p) => p.inherit)
  const paynotes = ownPaynotes || formatPaynotes

  // object if this document is a series «master» itself
  let series = meta.series
  // string, aka github url if this document belongs to a series
  if (typeof series === 'string') {
    const seriesDocument = resolver(meta.series)
    series = seriesDocument && seriesDocument.content.meta.series
  }
  if (series) {
    series = {
      ...series,
      ...(series.overview && { overview: resolver(series.overview) }),
      episodes: (series.episodes || []).map((episode) => ({
        ...episode,
        document: resolver(episode.document),
      })),
    }
  }

  const recommendationsNodes = meta.recommendations
    ?.map(resolver)
    .filter(Boolean)

  const recommendations = recommendationsNodes?.length && {
    nodes: recommendationsNodes,
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
    },
    totalCount: recommendationsNodes.length,
  }

  const isPaywallExcluded =
    meta.isPaywallExcluded || format?.meta.isPaywallExcluded

  return {
    series,
    dossier: resolver(meta.dossier),
    format,
    section: resolver(meta.section),
    discussion: resolver(meta.discussion),
    paynotes,
    recommendations,
    isPaywallExcluded,
  }
}

const isRestricted = (doc) => {
  const resolver = createResolver(doc._all)
  const formatDoc = resolver(doc.meta?.format)

  return doc.meta?.isRestricted || formatDoc?.meta?.isRestricted
}

const shouldStripDocLinks = (user, doc) =>
  isRestricted(doc) &&
  // user is undefined during publish -> no stripping
  // null during document delivery -> strip unless authorized
  user !== undefined &&
  !hasFullDocumentAccess(user, doc._apiKey)

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

const extractIdsFromNode = (node) => {
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
  getRepoId,
  extractIdsFromNode,
  extractUserUrl,
  createResolver,
  contentUrlResolver,
  metaUrlResolver,
  metaFieldResolver,
  stringifyNode,
}
