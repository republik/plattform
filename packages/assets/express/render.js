const renderUrl = require('../lib/renderUrl')
const { returnImage } = require('../lib')
const getWidthHeight = require('../lib/getWidthHeight')
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
    const {
      url,
      viewport,
      zoomFactor,
      width: _width,
      height: _height
    } = req.query

    let width, height
    if (viewport) {
      try {
        ({ width, height } = getWidthHeight(viewport))
      } catch (e) {
        res.status(400).end(e.message)
      }
    } else if (_width || _height) {
      width = _width
      height = _height
    }

    const allowed =
      whitelistedUrls &&
      !!whitelistedUrls.find(whiteUrl => url.indexOf(whiteUrl) === 0)

    if (!allowed) {
      console.warn('unauthorized render url requested: ' + url)
      return res.status(403).end()
    }
    debug('GET %s', url)

    let result
    try {
      result = await renderUrl(url, width, height, zoomFactor)
    } catch (e) {
      res.status(500).end(e.message)
    }

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
