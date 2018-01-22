const sharp = require('sharp')
const getWidthHeight = require('./getWidthHeight')
const fileTypeStream = require('file-type-stream').default
const { PassThrough } = require('stream')

module.exports = async (res, stream, resize) => {
  let width, height
  try {
    ({ width, height} = getWidthHeight(resize))
  } catch (e) {
    res.status(400).end(e.message)
  }

  const passThrough = new PassThrough()

  const { mime } = await new Promise(resolve => {
    stream.pipe(fileTypeStream(resolve)).pipe(passThrough)
  })
  const isJPEG = mime === 'image/jpeg'
  const isGIF = mime === 'image/gif'

  if (isGIF) {
    return passThrough.pipe(res)
  }

  if (width || height || isJPEG) {
    const pipeline = sharp()
    if (width || height) {
      pipeline.resize(width, height)
    }
    if (isJPEG) {
      pipeline.jpeg({
        progressive: true,
        quality: 80
      })
    }
    return passThrough.pipe(pipeline).pipe(res)
  }

  return passThrough.pipe(res)
}
