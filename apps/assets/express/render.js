const nodePath = require('path')
const {
  returnImage,
  getWidthHeight,
} = require('@orbiting/backend-modules-assets/lib')
const screenshot = require('@orbiting/backend-modules-assets/lib/screenshot/chromium')
const debug = require('debug')('assets:render')

module.exports = (server) => {
  server.get('/render', async function (req, res) {
    const { viewport, width: _width, height: _height } = req.query

    let width, height
    if (viewport) {
      try {
        ;({ width, height } = getWidthHeight(viewport))
      } catch (e) {
        res.status(400).end(e.message)
      }
    } else if (_width || _height) {
      width = _width
      height = _height
    }

    const params = {
      ...req.query,
      width,
      height,
    }

    debug('GET %o', params)

    let result, error
    try {
      result = await screenshot(params)
    } catch (e) {
      error = e
    }

    if (error || !result) {
      console.error(`render failed: ${error && error.message}`, {
        error,
        result,
        params,
      })
      return res.status(500).end((error && error.message) || 'server error')
    }

    if (req.query?.download) {
      const filename = nodePath.basename(req.path)

      if (filename) {
        res.set('Content-Disposition', `attachment; filename="${filename}"`)
      }
    }

    await returnImage({
      response: res,
      stream: result,
      options: {
        ...req.query,
        cacheTags: ['render'],
      },
      req,
    })
  })
}
