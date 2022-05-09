const checkEnv = require('check-env')
const visit = require('unist-util-visit')
const { hasFullDocumentAccess } = require('./restrictions')

checkEnv(['FRONTEND_BASE_URL'])

const {
  GITHUB_LOGIN,
  GITHUB_ORGS = GITHUB_LOGIN,
  FRONTEND_BASE_URL,
  DOCUMENTS_LINKS_RESTRICTED,
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
  (
    _all = [],
    _usernames = [],
    errors = [],
    urlPrefix = '',
    searchString = '',
    externalBaseUrl,
  ) =>
  (url, stripDocLinks) => {
    const userInfo = extractUserPath(url)
    if (userInfo) {
      const user = _usernames.find((u) => u.id === userInfo.id)
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
      const linkedFormat = createResolver(
        _all,
        _usernames,
      )(linkedDoc.meta?.format)
      const formatExternalBaseUrl = linkedFormat?.meta?.externalBaseUrl

      const baseUrl = formatExternalBaseUrl || urlPrefix || ''

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

      // If {externalBaseUrl} is given, replace {externalBaseUrl} to return
      // relative URLs.
      if (externalBaseUrl) {
        const externalBasePath = new URL(externalBaseUrl)?.pathname
        return resolvedUrl
          .toString()
          .replace(new RegExp(`^${externalBaseUrl}`), externalBasePath)
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
  (_all, _usernames, errors = []) =>
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
        _usernames,
      }
    }

    errors.push(repoId)
    return null
  }

const contentUrlResolver = (
  doc,
  _all = [],
  _usernames = [],
  errors,
  urlPrefix,
  searchString,
  user,
) => {
  const docResolver = createResolver(_all, _usernames, errors)
  const externalBaseUrl = docResolver(doc.meta?.format)?.meta?.externalBaseUrl

  const urlReplacer = createUrlReplacer(
    _all,
    _usernames,
    errors,
    urlPrefix,
    searchString,
    externalBaseUrl,
  )

  const stripDocLinks =
    DOCUMENTS_LINKS_RESTRICTED &&
    DOCUMENTS_LINKS_RESTRICTED.split(',').includes(doc.meta?.path) &&
    // user is undefined during publish -> no stripping
    // null during document delivery -> strip unless authorized
    user !== undefined &&
    !hasFullDocumentAccess(user, doc._apiKey)

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
        node.data.urlMeta = {
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
  _all = [],
  _usernames = [],
  errors,
  urlPrefix,
  searchString,
  user,
  apiKey,
) => {
  const urlReplacer = createUrlReplacer(
    _all,
    _usernames,
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

  meta.credits &&
    meta.credits
      .filter((c) => c.type === 'link')
      .forEach((c) => {
        c.url = urlReplacer(c.url)
      })

  if (user === undefined || !hasFullDocumentAccess(user, apiKey)) {
    meta.recommendations = null
  }
}

const metaFieldResolver = (meta, _all = [], _usernames = [], errors) => {
  const resolver = createResolver(_all, _usernames, errors)

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

  return {
    series,
    dossier: resolver(meta.dossier),
    format,
    section: resolver(meta.section),
    discussion: resolver(meta.discussion),
    paynotes,
    recommendations,
  }
}

module.exports = {
  getRepoId,
  createResolver,
  createUrlReplacer,
  extractUserUrl,
  contentUrlResolver,
  metaUrlResolver,
  metaFieldResolver,
}
