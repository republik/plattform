const sharp = require('sharp')
const getWidthHeight = require('./getWidthHeight')
const getCropDimensions = require('./getCropDimensions')
const { fileTypeStream } = require('file-type-stream2')
const { PassThrough, Readable } = require('stream')
const toArray = require('stream-to-array')
const debug = require('debug')('assets:returnImage')
const { parse: parsePath } = require('path')
const colorString = require('color-string')

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
    responseHeaders,
    crop,
    size,
    quality,
    bg, // background color-string
  } = options
  const qualityInt = parseInt(quality, 10)
  const resolvedQuality =
    !isNaN(qualityInt) && qualityInt <= 100 && qualityInt > 0 ? qualityInt : 80

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
  headers &&
    pipeHeaders.forEach((name) => {
      const value = headers.get(name)
      if (value) {
        res.set(name, value)
      }
    })

  // Loop through options.reponseHeaders array and set each as a
  // response header.
  responseHeaders &&
    responseHeaders.forEach(({ name, value }) => {
      res.set(name, value)
    })

  /**
   * {stream} is a ReadableStream provided by fetch Response.body
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Response/body
   *
   * To process futher, we need a (node) "Readable" stream.
   * @see https://nodejs.org/docs/latest-v18.x/api/stream.html#readable-streams
   */
  const readableStream = Readable.fromWeb(stream)

  // detect mime
  const passThrough = new PassThrough()
  try {
    let mime
    try {
      const fileTypeResult = await new Promise((resolve, reject) => {
        readableStream
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
      res.set('Content-Type', mime)
    }
    res.set(
      'Cache-Tag',
      cacheTags
        .concat(mime && mime.split('/'))
        .concat(format === 'auto' && 'auto')
        .filter(Boolean)
        .join(' '),
    )

    if (format === 'auto') {
      res.set('Vary', 'Accept')
      if (req.get('Accept')?.includes('image/webp')) {
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
          left: Math.floor((cropX / 100) * fileWidth),
          top: Math.floor((cropY / 100) * fileHeight),
          width: Math.floor((cropWidth / 100) * fileWidth),
          height: Math.floor((cropHeight / 100) * fileHeight),
        })
      }

      if (width || height) {
        pipeline.resize(width, height)
      }
      if (bw) {
        pipeline.greyscale()
      }

      if (format) {
        res.set('Content-Type', `image/${format}`)
        if (path) {
          res.set(
            'Content-Disposition',
            `inline; filename="${parsePath(path).name}.${format}"`,
          )
        }

        if (bg && colorString.get(bg)) {
          pipeline.flatten({ background: bg })
        }

        pipeline.toFormat(format, {
          // avoid interlaced pngs
          // - not supported in pdfkit
          progressive: format === 'jpeg',
          quality: resolvedQuality,
        })
      } else if (isJPEG) {
        pipeline.jpeg({
          progressive: true,
          quality: resolvedQuality,
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
      res.set('Content-Length', headers.get('Content-Length'))
      passThrough.pipe(res)
    } else {
      // convert stream to buffer, because our cdn doesn't cache if content-length is missing
      const result = pipeline
        ? await toBuffer(passThrough.pipe(pipeline))
        : await toBuffer(passThrough)
      res.end(result)

      readableStream.destroy()
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
    readableStream && readableStream.destroy()
    passThrough && passThrough.destroy()
  }
  debug('sharp stats: %o', sharp.cache())
}
