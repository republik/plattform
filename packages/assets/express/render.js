const {
  returnImage,
  getWidthHeight,
  s3
} = require('../lib')
const screenshot = require('../lib/screenshot/chromium')
const debug = require('debug')('assets:render')
const crypto = require('crypto')
const { ascending } = require('d3-array')

const { AWS_S3_BUCKET } = process.env
const cacheS3Path = `render-cache/`

const getCacheKey = (params) => {
  const paramsString = Object.keys(params)
    .sort(ascending)
    .map(key => `${key}:${params[key]}`)
    .join('::')
  const sha = crypto.createHash('sha256')
    .update(paramsString)
    .digest('hex')
  const s3KeyEncode = string => encodeURIComponent(string).replace(/%/g, 'C')
  const url = (params.url || '').replace('https://', '')
  return `${s3KeyEncode(url).slice(0, 500)}-${sha}`
}

module.exports = (server) => {
  server.get('/render', async function (req, res) {
    const {
      viewport,
      width: _width,
      height: _height,
      permanentCacheKey
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

    const params = {
      ...req.query,
      width,
      height
    }

    let cachePath
    if (!!permanentCacheKey && AWS_S3_BUCKET) {
      cachePath = `${cacheS3Path}${getCacheKey(params)}`

      const cacheResult = await s3.get({
        bucket: AWS_S3_BUCKET,
        path: cachePath
      })

      if (cacheResult.ok) {
        ['Content-Type', 'Content-Length'].forEach(key => {
          res.set(key, cacheResult.headers.get(key))
        })
        res.set('Cache-Tag', ['render', 'permanentCache']
          .concat((res.get('Content-Type') || '').split('/'))
          .filter(Boolean)
          .join(' ')
        )
        cacheResult.body.pipe(res)
        return
      }
    }

    debug('GET %o', params)

    let result, error
    try {
      result = await screenshot(params)
    } catch (e) {
      error = e
    }

    if (error || !result) {
      console.error(
        `render failed: ${error && error.message}`,
        { error, result, params }
      )
      return res.status(500).end(
        (error && error.message) || 'server error'
      )
    }

    const imageResult = await returnImage({
      response: res,
      stream: result,
      options: {
        ...req.query,
        cacheTags: ['render']
      },
      returnResult: !!cachePath
    })

    if (imageResult && cachePath && AWS_S3_BUCKET) {
      await s3.upload({
        stream: imageResult.body,
        mimeType: imageResult.mime,
        path: cachePath,
        bucket: AWS_S3_BUCKET
      })
    }
  })
}
