const {
  renderUrl,
  returnImage,
  getWidthHeight
} = require('../lib')
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
      fullPage,
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
      url &&
      whitelistedUrls &&
      !!whitelistedUrls.find(whiteUrl => url.indexOf(whiteUrl) === 0)

    if (!allowed) {
      console.warn('unauthorized render url requested: ' + url)
      return res.status(403).end()
    }
    debug('GET %s', url)

    let result, error
    try {
      result = await renderUrl(url, width, height, zoomFactor, fullPage)
    } catch (e) {
      error = e
    }

    if (error || !result) {
      console.error(
        `render failed: ${error && error.message}`,
        { error, url, width, height, zoomFactor, fullPage, result }
      )
      return res.status(500).end(
        (error && error.message) || 'server error'
      )
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
