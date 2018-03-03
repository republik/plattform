const sharp = require('sharp')
const getWidthHeight = require('./getWidthHeight')
const fileTypeStream = require('file-type-stream').default
const { PassThrough } = require('stream')
const toArray = require('stream-to-array')

const pipeHeaders = [
  'Content-Type',
  'Last-Modified',
  'cache-control',
  'expires',
  'Access-Control-Allow-Credentials',
  'Access-Control-Allow-Headers',
  'Access-Control-Allow-Methods',
  'Access-Control-Allow-Origin'
]

module.exports = async ({
  response: res,
  stream,
  headers,
  options = {}
}) => {
  const { resize, bw } = options
  const webp = false
  let width, height
  if (resize) {
    try {
      ({ width, height } = getWidthHeight(resize))
    } catch (e) {
      res.status(400).end(e.message)
    }
  }

  // forward filtered headers
  if (headers) {
    for (let key of pipeHeaders) {
      const value = headers.get(key)
      if (value) {
        res.set(key, value)
      }
    }
  }

  // detect mime
  const passThrough = new PassThrough()
  let mime
  try {
    ({ mime } = await new Promise(resolve => {
      stream.pipe(fileTypeStream(resolve)).pipe(passThrough)
    }))
  } catch (e) { }
  const isJPEG = mime === 'image/jpeg'

  // convert stream to buffer, because our cdn doesn't cache if
  // content-length is missing
  const buffer = await toArray(passThrough)
    .then(parts => {
      const buffers = parts
        .map(part => Buffer.isBuffer(part) ? part : Buffer.from(part))
      return Buffer.concat(buffers)
    })

  // return unknown mime types, non images, and gifs without manipulation
  if (
    (!mime || mime.indexOf('image') !== 0 || mime === 'image/gif') ||
    !(width || height || bw || webp || isJPEG)
  ) {
    return res.end(buffer)
  } else {
    // update 'Content-Type'
    res.set('Content-Type', webp
      ? 'image/webp'
      : mime
    )

    const pipeline = sharp(buffer)
    if (width || height) {
      pipeline.resize(width, height)
    }
    if (bw) {
      pipeline.greyscale()
    }
    if (webp) {
      pipeline.toFormat('webp', {
        quality: 80
      })
    } else if (isJPEG) {
      pipeline.jpeg({
        progressive: true,
        quality: 80
      })
    }
    return res.end(await pipeline.toBuffer())
  }
}
