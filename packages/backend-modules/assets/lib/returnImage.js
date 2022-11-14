const sharp = require('sharp')
const getWidthHeight = require('./getWidthHeight')
const getCropDimensions = require('./getCropDimensions')
const { fileTypeStream } = require('file-type-stream2')
const { PassThrough } = require('stream')
const toArray = require('stream-to-array')
const debug = require('debug')('assets:returnImage')
const { parse: parsePath } = require('path')

const { SHARP_NO_CACHE } = process.env

if (SHARP_NO_CACHE) {
  console.info('sharp cache disabled! (SHARP_NO_CACHE)')
  sharp.cache(false)
}

const pipeHeaders = [
  'Content-Type',
  'Last-Modified',
  'cache-control',
  'expires',
  'Access-Control-Allow-Credentials',
  'Access-Control-Allow-Headers',
  'Access-Control-Allow-Methods',
  'Access-Control-Allow-Origin',
  'Link',
  'Content-Disposition',
  'X-Robots-Tag',
]

const supportedFormats = ['jpeg', 'png', 'webp', 'auto']

const toBuffer = async (stream) => {
  return toArray(stream).then((parts) => {
    const buffers = parts.map((part) =>
      Buffer.isBuffer(part) ? part : Buffer.from(part),
    )
    return Buffer.concat(buffers)
  })
}

module.exports = async ({
  response: res,
  stream,
  headers,
  options = {},
  path,
  returnResult,
  req,
}) => {
  const {
    resize,
    bw,
    webp,
    format: _format,
    cacheTags = [],
    crop,
    size,
  } = options
  let format =
    _format && supportedFormats.indexOf(_format) !== -1
      ? _format
      : webp
      ? 'webp'
      : null

  let width, height
  if (resize) {
    try {
      ;({ width, height } = getWidthHeight(resize, false))
    } catch (e) {
      return res.status(400).send(e.message)
    }
  }

  let fileWidth, fileHeight
  if (size) {
    try {
      ;({ width: fileWidth, height: fileHeight } = getWidthHeight(size, true))
    } catch (e) {
      return res.status(400).send(e.message)
    }
  }

  let cropX, cropY, cropWidth, cropHeight
  if (crop) {
    try {
      if (!size) {
        throw new Error('crop requires size parameter')
      }
      ;({ cropX, cropY, cropWidth, cropHeight } = getCropDimensions(crop))
    } catch (e) {
      return res.status(400).send(e.message)
    }
  }

  // forward filtered headers
  if (headers) {
    for (const key of pipeHeaders) {
      const value = headers.get(key)
      if (value) {
        res.setHeader(key, value)
      }
    }
  }

  if (!res.getHeader('cache-control')) {
    // if max age is not specified: allow CDNs to cache for a day
    const maxAge = 60 * 60 * 24 * 1
    res.setHeader('Cache-Control', `public, max-age=${maxAge}`)
  }

  // detect mime
  const passThrough = new PassThrough()
  try {
    let mime
    try {
      const fileTypeResult = await new Promise((resolve, reject) => {
        stream
          .pipe(fileTypeStream(resolve))
          .pipe(passThrough)
          .on(
            'finish',
            reject.bind(null, 'Could not read enough of file to get mimetype'),
          )
      })
      mime = fileTypeResult && fileTypeResult.mime
    } catch (e2) {
      debug('detecting mime failed: ', e2)
    }
    const isJPEG = mime === 'image/jpeg'

    // svg is not detected by fileTypeStream
    if (
      (!mime ||
        mime === 'application/octet-stream' ||
        mime === 'application/xml') &&
      path &&
      new RegExp(/\.svg(\.webp)?$/).test(path)
    ) {
      mime = 'image/svg+xml'
    }

    // apks are detected as zip by fileTypeStream
    if (
      (!mime || mime === 'application/zip') &&
      path &&
      new RegExp(/\.apk$/).test(path)
    ) {
      mime = 'application/vnd.android.package-archive'
    }

    // fix content type if necessary
    // - e.g. requests to github always return Content-Type: text/plain
    // - s3 svg need to be rewritten from application/octet-stream to image/svg+xml
    if (
      mime &&
      (mime !== 'application/octet-stream' ||
        headers?.get('Content-Type')?.startsWith('text/plain'))
    ) {
      res.setHeader('Content-Type', mime)
    }
    res.setHeader(
      'Cache-Tag',
      cacheTags
        .concat(mime && mime.split('/'))
        .concat(format === 'auto' && 'auto')
        .filter(Boolean)
        .join(' '),
    )

    if (format === 'auto') {
      res.setHeader('Vary', 'Accept')
      if (req.headers.accept?.includes('image/webp')) {
        format = 'webp'
      } else {
        format = null
      }
    }

    let pipeline
    if (
      (width || height || bw || format || crop || isJPEG) &&
      // only touch images
      mime &&
      mime.indexOf('image') === 0 &&
      // don't touch gifs exept format is set and not webp
      (mime !== 'image/gif' || (format && format !== 'webp')) &&
      // don't touch xmls exept format is set and not webp
      (mime !== 'image/svg+xml' || (format && format !== 'webp'))
    ) {
      pipeline = sharp()

      if (crop && size) {
        pipeline.extract({
          left: Math.ceil((cropX / 100) * fileWidth),
          top: Math.ceil((cropY / 100) * fileHeight),
          width: Math.ceil((cropWidth / 100) * fileWidth),
          height: Math.ceil((cropHeight / 100) * fileHeight),
        })
      }

      if (width || height) {
        pipeline.resize(width, height)
      }
      if (bw) {
        pipeline.greyscale()
      }

      if (format) {
        res.setHeader('Content-Type', `image/${format}`)
        if (path) {
          res.setHeader(
            'Content-Disposition',
            `inline; filename="${parsePath(path).name}.${format}"`,
          )
        }
        pipeline.toFormat(format, {
          // avoid interlaced pngs
          // - not supported in pdfkit
          progressive: format === 'jpeg',
          quality: 80,
        })
      } else if (isJPEG) {
        pipeline.jpeg({
          progressive: true,
          quality: 80,
        })
      }
    }

    if (
      !pipeline &&
      !returnResult &&
      headers &&
      headers.get('Content-Length') &&
      !headers.get('Content-Encoding') // gzipped content can't be piped
    ) {
      // shortcut
      res.setHeader('Content-Length', headers.get('Content-Length'))
      passThrough.pipe(res)
    } else {
      // convert stream to buffer, because our cdn doesn't cache if content-length is missing
      const result = pipeline
        ? await toBuffer(passThrough.pipe(pipeline))
        : await toBuffer(passThrough)
      res.end(result)

      stream.destroy()
      passThrough.destroy()

      if (returnResult) {
        return {
          body: result,
          mime,
        }
      }
    }
  } catch (e) {
    console.error(e)
    res.status(500).end()
    stream && stream.destroy()
    passThrough && passThrough.destroy()
  }
  debug('sharp stats: %o', sharp.cache())
}
