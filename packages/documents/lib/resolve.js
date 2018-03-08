const checkEnv = require('check-env')
const { parse } = require('url')
const visit = require('unist-util-visit')

checkEnv([
  'GITHUB_LOGIN',
  'FRONTEND_BASE_URL'
])

const {
  GITHUB_LOGIN,
  FRONTEND_BASE_URL
} = process.env

const PUBLIC_HOSTNAME = parse(FRONTEND_BASE_URL).hostname

const getRepoId = (url, requireQuery) => {
  if (!url) {
    return
  }
  const {
    hostname,
    pathname,
    query
  } = parse(String(url))
  if (!pathname) { // empty for mailto
    return
  }
  const pathSegments = pathname.split('/').filter(Boolean)
  if (
    hostname !== 'github.com' ||
    pathSegments.length !== 2 ||
    pathSegments[0] !== GITHUB_LOGIN
  ) {
    return
  }
  if (requireQuery && query !== requireQuery) {
    return
  }
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
  const urlObject = parse(String(url))
  if (
    urlObject.hostname &&
    urlObject.hostname !== PUBLIC_HOSTNAME
  ) {
    // do nothing if url has a hostname and it's not ours
    return
  }
  return extractUserPath(
    `${urlObject.path}${urlObject.hash || ''}`
  )
}

const createUrlReplacer = (allDocuments = [], usernames = [], errors = [], urlPrefix = '', searchString = '') => url => {
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
  const linkedDoc = allDocuments
    .find(d => d.repoId === repoId)
  if (linkedDoc) {
    return urlPrefix + linkedDoc.content.meta.path + searchString
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
    .find(d => d.repoId === repoId)
  if (linkedDoc) {
    return linkedDoc
  } else {
    errors.push(repoId)
  }
  return null
}

const contentUrlResolver = (doc, allDocuments = [], usernames = [], errors, urlPrefix, searchString) => {
  const urlReplacer = createUrlReplacer(
    allDocuments,
    usernames,
    errors,
    urlPrefix,
    searchString
  )

  visit(doc.content, 'link', node => {
    node.url = urlReplacer(node.url)
  })
  visit(doc.content, 'zone', node => {
    if (node.data) {
      node.data.url = urlReplacer(node.data.url)
      node.data.formatUrl = urlReplacer(node.data.formatUrl)
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
