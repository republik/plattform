const checkEnv = require('check-env')
const visit = require('unist-util-visit')
const { Roles: { userIsInRoles } } = require('@orbiting/backend-modules-auth')

checkEnv([
  'FRONTEND_BASE_URL'
])

const {
  GITHUB_LOGIN,
  GITHUB_ORGS = GITHUB_LOGIN,
  FRONTEND_BASE_URL,
  DOCUMENTS_RESTRICT_TO_ROLES,
  DOCUMENTS_LINKS_RESTRICTED
} = process.env

const PUBLIC_HOSTNAME = (new URL(FRONTEND_BASE_URL)).hostname

const getRepoId = (url, requireQuery) => {
  checkEnv([
    'GITHUB_LOGIN'
  ])

  if (!url) {
    return
  }
  const {
    hostname,
    pathname,
    searchParams
  } = new URL(String(url), FRONTEND_BASE_URL)
  if (!pathname) { // empty for mailto
    return
  }
  const pathSegments = pathname.split('/').filter(Boolean)
  if (
    hostname !== 'github.com' ||
    pathSegments.length !== 2 ||
    !GITHUB_ORGS.split(',').includes(pathSegments[0])
  ) {
    return
  }
  if (requireQuery && !searchParams.has(requireQuery)) {
    return
  }
  pathSegments[0] = GITHUB_LOGIN
  return pathSegments.join('/')
}

const userPath = /^\/~([^/?#]+)/

const extractUserPath = path => {
  if (!path) {
    return
  }
  const match = String(path).match(userPath)
  const id = match && match[1]
  if (id) {
    return {
      id,
      path
    }
  }
}

const extractUserUrl = url => {
  if (!url) {
    return
  }
  const urlObject = new URL(String(url), FRONTEND_BASE_URL)
  if (
    urlObject.hostname &&
    urlObject.hostname !== PUBLIC_HOSTNAME
  ) {
    // do nothing if url has a hostname and it's not ours
    return
  }
  return extractUserPath(
    `${urlObject.pathname}${urlObject.search}${urlObject.hash}`
  )
}

const createUrlReplacer = (allDocuments = [], usernames = [], errors = [], urlPrefix = '', searchString = '') => (url, stripDocLinks) => {
  const userInfo = extractUserPath(url)
  if (userInfo) {
    const user = usernames
      .find(u => u.id === userInfo.id)
    if (user) {
      return [
        urlPrefix,
        userInfo.path.replace(
          user.id,
          user.username
        ),
        searchString
      ].join('')
    }
  }

  const repoId = getRepoId(url, 'autoSlug')
  if (!repoId) {
    return url
  }
  if (stripDocLinks) {
    return ''
  }
  const linkedDoc = allDocuments
    .find(d => d.meta.repoId === repoId)
  if (linkedDoc) {
    const hash = url.split('#')[1]
    return `${urlPrefix}${linkedDoc.content.meta.path}${searchString}${hash ? `#${hash}` : ''}`
  } else {
    errors.push(repoId)
  }
  // autoSlug links pointing to
  // not published or missing documents are stripped
  return ''
}

const createResolver = (allDocuments, errors = []) => url => {
  const repoId = getRepoId(url)
  if (!repoId) {
    return null
  }
  const linkedDoc = allDocuments
    .find(d => d.meta.repoId === repoId)
  if (linkedDoc) {
    return linkedDoc
  } else {
    errors.push(repoId)
  }
  return null
}

const contentUrlResolver = (doc, allDocuments = [], usernames = [], errors, urlPrefix, searchString, user) => {
  const urlReplacer = createUrlReplacer(
    allDocuments,
    usernames,
    errors,
    urlPrefix,
    searchString
  )
  const docResolver = createResolver(allDocuments, errors)

  const stripDocLinks =
    DOCUMENTS_RESTRICT_TO_ROLES &&
    DOCUMENTS_LINKS_RESTRICTED &&
    DOCUMENTS_LINKS_RESTRICTED.split(',').includes(doc.meta.path) &&
    user !== undefined &&
    !userIsInRoles(user, DOCUMENTS_RESTRICT_TO_ROLES.split(','))

  visit(doc.content, 'link', node => {
    node.url = urlReplacer(node.url, stripDocLinks)
  })
  visit(doc.content, 'zone', node => {
    if (node.data) {
      const linkedDoc = docResolver(node.data.url)
      if (linkedDoc) {
        // this is used for the overview page
        // - assigns a publishDate to an teaser
        // - highlights all teasers of a format or series
        node.data.urlMeta = {
          repoId: linkedDoc.meta.repoId,
          publishDate: linkedDoc.meta.publishDate,
          section: linkedDoc.meta.template === 'section'
            ? linkedDoc.meta.repoId
            : getRepoId(linkedDoc.meta.section),
          format: linkedDoc.meta.template === 'format'
            ? linkedDoc.meta.repoId
            : getRepoId(linkedDoc.meta.format),
          series: linkedDoc.meta.series ? (
            typeof linkedDoc.meta.series === 'string'
              ? getRepoId(linkedDoc.meta.series)
              : linkedDoc.meta.repoId
          ) : undefined
        }
      }
      node.data.url = urlReplacer(node.data.url, stripDocLinks)
      node.data.formatUrl = urlReplacer(node.data.formatUrl, stripDocLinks)
    }
  })
}

const metaUrlResolver = (meta, allDocuments = [], usernames = [], errors, urlPrefix, searchString) => {
  const urlReplacer = createUrlReplacer(
    allDocuments,
    usernames,
    errors,
    urlPrefix,
    searchString
  )

  meta.credits && meta.credits
    .filter(c => c.type === 'link')
    .forEach(c => {
      c.url = urlReplacer(c.url)
    })
}

const metaFieldResolver = (meta, allDocuments = [], errors) => {
  const resolver = createResolver(allDocuments, errors)

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
      episodes: (series.episodes || []).map(episode => ({
        ...episode,
        document: resolver(episode.document)
      }))
    }
  }

  return {
    series,
    dossier: resolver(meta.dossier),
    format: resolver(meta.format),
    section: resolver(meta.section),
    discussion: resolver(meta.discussion)
  }
}

module.exports = {
  getRepoId,
  createResolver,
  createUrlReplacer,
  extractUserUrl,
  contentUrlResolver,
  metaUrlResolver,
  metaFieldResolver
}
