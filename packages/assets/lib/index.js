const { URL } = require('url')
const querystring = require('querystring')
const crypto = require('crypto')
const checkEnv = require('check-env')

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

  createRepoUrlPrefixer: (repoId, public) => {
    if (!repoId) {
      throw new Error('createRepoUrlPrefixer needs a repoId')
    }
    return path => {
      if (path && path.indexOf('images/') > -1) {
        const url = new URL(`${ASSETS_SERVER_BASE_URL}/assets/images/${repoId}/${path}`)
        if (!public) {
          url.hash = querystring.stringify({
            [originalKey]: path
          })
        }
        return url.toString()
      }
      return path
    }
  },

  createUrlPrefixer: public => url => {
    return `${ASSETS_SERVER_BASE_URL}/assets/images?` + querystring.stringify({
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
