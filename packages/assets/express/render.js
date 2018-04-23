const renderUrl = require('../lib/renderUrl')
const { returnImage } = require('../lib')
const debug = require('debug')('assets:render')

const {
  RENDER_URL_WHITELIST
} = process.env

if (!RENDER_URL_WHITELIST) {
  console.warn('missing env RENDER_URL_WHITELIST, the /render endpoint will not work')
}
const whitelistedUrls = RENDER_URL_WHITELIST && RENDER_URL_WHITELIST.split(',')

module.exports = (server) => {
  server.get('/render', async function (req, res) {
    const { url, width, height, zoomFactor } = req.query

    const allowed =
      whitelistedUrls &&
      !!whitelistedUrls.find(whiteUrl => url.indexOf(whiteUrl) === 0)

    if (!allowed) {
      console.warn('unauthorized render url requested: ' + url)
      return res.status(403).end()
    }
    debug('GET %s', url)

    const result = await renderUrl(url, width || 1200, height || 628, zoomFactor)
    if (!result.ok) {
      console.error('render failed', result.url, result.status)
      return res.status(result.status).end()
    }

    return returnImage({
      response: res,
      stream: result.body,
      headers: result.headers,
      options: req.query
    })
  })
}
