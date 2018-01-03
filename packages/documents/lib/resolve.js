const checkEnv = require('check-env')
const { parse } = require('url')

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

const createUrlReplacer = (allDocuments = [], usernames = []) => url => {
  const userInfo = extractUserPath(url)
  if (userInfo) {
    const user = usernames
      .find(u => u.id === userInfo.id)
    if (user) {
      return userInfo.path.replace(
        user.id,
        user.username
      )
    }
  }

  const repoId = getRepoId(url, 'autoSlug')
  if (!repoId) {
    return url
  }
  const linkedDoc = allDocuments
    .find(d => d.repoId === repoId)
  if (linkedDoc) {
    return linkedDoc.content.meta.path
  }
  // autoSlug links pointing to
  // not published or missing documents are stripped
  return ''
}

const createResolver = allDocuments => url => {
  const repoId = getRepoId(url)
  if (!repoId) {
    return null
  }
  const linkedDoc = allDocuments
    .find(d => d.repoId === repoId)
  if (linkedDoc) {
    return linkedDoc
  }
  return null
}

module.exports = {
  createResolver,
  createUrlReplacer,
  extractUserUrl
}
