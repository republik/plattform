const { URL } = require('url')
const querystring = require('querystring')

const {
  PUBLIC_ASSETS_URL,
  INTERNAL_ASSETS_URL,
} = process.env

if (!PUBLIC_ASSETS_URL && !INTERNAL_ASSETS_URL) {
  throw new Error('You need to at least set either PUBLIC_ASSETS_URL or INTERNAL_ASSETS_URL')
}

const originalKey = 'originalURL'

module.exports = {
  createPrefixUrl: (repoId, public) => {
    if (!repoId) {
      throw new Error('createPrefixUrl needs a repoId')
    }
    return urlStr => {
      if (urlStr && urlStr.indexOf('images/') > -1) {
        let url
        if (public) {
          if (!PUBLIC_ASSETS_URL) {
            throw new Error('missing PUBLIC_ASSETS_URL')
          }
          url = new URL(`${PUBLIC_ASSETS_URL}/${repoId}/${urlStr}`)
        } else {
          if (!INTERNAL_ASSETS_URL) {
            throw new Error('missing INTERNAL_ASSETS_URL')
          }
          url = new URL(`${INTERNAL_ASSETS_URL}/${repoId}/${urlStr}`)
          url.hash = querystring.stringify({
            [originalKey]: urlStr
          })
        }
        return url.toString()
      }
      return urlStr
    }
  },

  unprefixUrl: urlStr => {
    try {
      const url = new URL(urlStr)
      if (url.hash.length > 0) {
        const hash = querystring.parse(url.hash.substring(1))
        const originalUrl = hash[originalKey]
        if (originalUrl) {
          return originalUrl
        }
      }
    } catch (e) { }
    return urlStr
  }
}
