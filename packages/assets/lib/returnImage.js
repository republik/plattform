const sharp = require('sharp')
const getWidthHeight = require('./getWidthHeight')
const fileTypeStream = require('file-type-stream').default
const { PassThrough } = require('stream')
const pick = require('lodash/pick')

module.exports = async ({
  response: res,
  stream,
  headers = {},
  options = {}
}) => {
  const { resize, bw, webp } = options
  let width, height
  try {
    if (resize) {
      ({ width, height} = getWidthHeight(resize))
    }
  } catch (e) {
    res.status(400).end(e.message)
  }

  // detect mime
  const passThrough = new PassThrough()
  const { mime } = await new Promise(resolve => {
    stream.pipe(fileTypeStream(resolve)).pipe(passThrough)
  })

  // set headers
  res.set(pick({
    ...headers,
    'Content-Type': webp
      ? 'image/webp'
      : mime
  }, [
    'Content-Type',
    'Last-Modified',
    'cache-control',
    'expires',
    'Access-Control-Allow-Credentials',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Origin',
  ]))

  const isJPEG = mime === 'image/jpeg'
  const isGIF = mime === 'image/gif'
  if (isGIF) {
    // ignore image manipulation without throwing an error
    return passThrough.pipe(res)
  }

  if (width || height || bw || webp || isJPEG) {
    const pipeline = sharp()
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
    return passThrough.pipe(pipeline).pipe(res)
  }

  return passThrough.pipe(res)
}
