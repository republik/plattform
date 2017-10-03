const { PUBLIC_ASSETS_URL } = process.env
const { URL } = require('url')
const querystring = require('querystring')

const originalKey = 'originalURL'

module.exports = {
  createPrefixUrl: (repoId, oneway) => {
    if (!repoId) {
      throw new Error('createPrefixUrl needs a repoId')
    }
    return urlStr => {
      if (urlStr && urlStr.indexOf('images/') > -1) {
        const url = new URL(`${PUBLIC_ASSETS_URL}/${repoId}/${urlStr}`)
        if (!oneway) {
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
