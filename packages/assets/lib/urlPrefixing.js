const { URL } = require('url')
const querystring = require('querystring')
const crypto = require('crypto')
const checkEnv = require('check-env')
const { getS3UrlForGithubPath } = require('./Repo')

checkEnv[
  'ASSETS_SERVER_BASE_URL',
  'ASSETS_HMAC_KEY'
]

const {
  ASSETS_SERVER_BASE_URL,
  ASSETS_HMAC_KEY
} = process.env

const originalKey = 'originalURL'

const authenticate = url =>
  crypto
    .createHmac('sha256', ASSETS_HMAC_KEY)
    .update(url)
    .digest('hex')

module.exports = {
  authenticate,

  createRepoUrlPrefixer: (repoId, _public, originalPaths = []) => {
    if (!repoId) {
      throw new Error('createRepoUrlPrefixer needs a repoId')
    }
    return path => {
      if (path && path.indexOf('images/') > -1) {
        let url
        if (_public) {
          url = new URL(getS3UrlForGithubPath(repoId, path))
        } else {
          url = new URL(`${ASSETS_SERVER_BASE_URL}/github/${repoId}/${path}`)
          url.hash = querystring.stringify({
            [originalKey]: path
          })
        }
        originalPaths.push(path)
        return url.toString()
      }
      return path
    }
  },

  createUrlPrefixer: _public => url => {
    return `${ASSETS_SERVER_BASE_URL}/proxy?` + querystring.stringify({
      [originalKey]: url,
      mac: authenticate(url)
    })
  },

  unprefixUrl: _url => {
    try {
      const url = new URL(_url)
      if (url.hash.length > 0) { //repo prefixed
        const hash = querystring.parse(url.hash.substring(1))
        const originalUrl = hash[originalKey]
        if (originalUrl) {
          return originalUrl
        }
      } else if (url.searchParams && url.searchParams.get(originalKey)) { // embed prefixed
        return url.searchParams.get(originalKey)
      }
    } catch (e) { }
    return _url
  }
}
