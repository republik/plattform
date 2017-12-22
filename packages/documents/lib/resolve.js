const checkEnv = require('check-env')
const { parse } = require('url')

checkEnv([
  'GITHUB_LOGIN'
])

const {
  GITHUB_LOGIN
} = process.env

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

const createAutoSlug = allDocuments => url => {
  const repoId = getRepoId(url, 'autoSlug')
  if (!repoId) {
    return url
  }
  const linkedDoc = allDocuments
    .find(d => d.repoId === repoId)
  if (linkedDoc) {
    return `/${linkedDoc.content.meta.slug}`
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
  createAutoSlug
}
