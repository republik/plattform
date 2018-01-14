const { URL } = require('url')
const querystring = require('querystring')
const crypto = require('crypto')
const checkEnv = require('check-env')

checkEnv[
  'ASSETS_HMAC_KEY'
]

const {
  PUBLIC_ASSETS_HOSTNAME,
  INTERNAL_ASSETS_HOSTNAME,
  ASSETS_HMAC_KEY
} = process.env

if (!PUBLIC_ASSETS_HOSTNAME && !INTERNAL_ASSETS_HOSTNAME) {
  throw new Error('You need to at least set either PUBLIC_ASSETS_HOSTNAME or INTERNAL_ASSETS_HOSTNAME')
}

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
        const hostname = public
          ? PUBLIC_ASSETS_HOSTNAME
          : INTERNAL_ASSETS_HOSTNAME
        const url = new URL(`${hostname}/assets/images/${repoId}/${path}`)
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
    const hostname = public
      ? PUBLIC_ASSETS_HOSTNAME
      : INTERNAL_ASSETS_HOSTNAME
    return `${hostname}/assets/images?` + querystring.stringify({
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
