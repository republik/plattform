const { URL } = require('url')
const querystring = require('querystring')
const crypto = require('crypto')

const { getS3Url } = require('./Repo')

const { ASSETS_SERVER_BASE_URL, ASSETS_HMAC_KEY } = process.env

if (!ASSETS_HMAC_KEY) {
  console.warn('missing env ASSETS_HMAC_KEY, proxying urls will not work')
}

const originalKey = 'originalURL'

const authenticate = (url) => {
  if (!ASSETS_HMAC_KEY) {
    throw new Error('missing ASSETS_HMAC_KEY')
  }
  return crypto.createHmac('sha256', ASSETS_HMAC_KEY).update(url).digest('hex')
}

const createRepoIdMatcher = (repoId) => (string) => {
  return !!(string?.indexOf(`/${repoId}/`) >= 0)
}

const isDataUrl = (string) => {
  return !!string?.startsWith('data:')
}

const isHttpUrl = (string) => {
  return !!string?.startsWith('http')
}

const isImagePath = (string) => {
  return !!string?.startsWith('images/')
}

const hasOriginalKeyHash = (string) => {
  return !!(string?.indexOf(`#${originalKey}=`) >= 0)
}

const isProxyUrl = (string) => {
  return !!(
    string?.indexOf('/proxy') >= 0 &&
    string?.indexOf(`${originalKey}=`) >= 0 &&
    string?.indexOf(`mac=`) >= 0
  )
}

module.exports = {
  authenticate,
  createRepoIdMatcher,
  isDataUrl,
  isHttpUrl,
  isImagePath,
  hasOriginalKeyHash,
  isProxyUrl,

  createRepoUrlPrefixer: (repoId, isPublic = false) => {
    if (!repoId) {
      throw new Error('createRepoUrlPrefixer needs a repoId')
    }
    return (path) => {
      if (isImagePath(path)) {
        const url = new URL(getS3Url(repoId, path))
        if (!isPublic) {
          url.hash = querystring.stringify({ [originalKey]: path })
        }
        return url.toString()
      }
      return path
    }
  },
  createRepoUrlUnprefixer: (repoId) => {
    if (!repoId) {
      throw new Error('createRepoUrlUnprefixer needs a repoId')
    }

    const hasRepoId = createRepoIdMatcher(repoId)

    return (url) => {
      if (hasRepoId(url) || isProxyUrl(url)) {
        try {
          const parsedUrl = new URL(url)
          if (parsedUrl.hash.length > 0) {
            const hash = querystring.parse(parsedUrl.hash.substring(1))
            const originalUrl = hash[originalKey]
            if (isImagePath(originalUrl)) {
              return originalUrl
            }
          } else {
            return parsedUrl.searchParams?.get(originalKey) || url
          }
        } catch (e) {}
      }

      return url
    }
  },
  createProxyUrlPrefixer: () => (url) => {
    if (isHttpUrl(url) && !isProxyUrl(url) && !hasOriginalKeyHash(url)) {
      return (
        `${ASSETS_SERVER_BASE_URL}/proxy?` +
        querystring.stringify({
          [originalKey]: url,
          mac: authenticate(url),
        })
      )
    }

    return url
  },
}
