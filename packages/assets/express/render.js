const renderUrl = require('../lib/renderUrl')
const { returnImage } = require('../lib')
const debug = require('debug')('assets:render')
const streamifier = require('streamifier')

const {
  RENDER_URL_WHITELIST
} = process.env

if (!RENDER_URL_WHITELIST) {
  console.warn('missing env RENDER_URL_WHITELIST, the /render endpoint will not work')
}
const whitelistedUrls = RENDER_URL_WHITELIST && RENDER_URL_WHITELIST.split(',')

module.exports = (server) => {
  server.get('/render', async function (req, res) {
    const { url, width: _width, height: _height, zoomFactor: _zoomFactor } = req.query

    const width = (_width && parseInt(_width)) || 1200
    const height = (_height && parseInt(_height)) || 628
    const zoomFactor = (_zoomFactor && parseFloat(_zoomFactor)) || 1

    const allowed =
      whitelistedUrls &&
      !!whitelistedUrls.find(whiteUrl => url.indexOf(whiteUrl) === 0)

    if (!allowed) {
      console.warn('unauthorized render url requested: ' + url)
      return res.status(403).end()
    }
    debug('GET %s', url)

    const result = await renderUrl(url, width, height, zoomFactor)
    if (!result) {
      console.error('render failed', result.url, result.status)
      return res.status(result.status).end()
    }

    return returnImage({
      response: res,
      stream: streamifier.createReadStream(result),
      options: {
        ...req.query,
        cacheTags: ['render']
      }
    })
  })
}
