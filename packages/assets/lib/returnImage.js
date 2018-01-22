const sharp = require('sharp')
const fileType = require('file-type')
const getWidthHeight = require('./getWidthHeight')

module.exports = async (res, buffer, resize) => {
  let width, height
  try {
    const dimensions = getWidthHeight(resize)
    width = dimensions.width
    height = dimensions.height
  } catch (e) {
    res.status(400).end(e.message)
  }

  const type = fileType(buffer)
  const isJPEG = type && type.ext === 'jpg'

  const isGIF = type && type.ext === 'gif'

  if (isGIF) {
    return res.end(buffer)
  }

  if (width || height || isJPEG) {
    let image = sharp(buffer)
    if (width || height) {
      image = image.resize(width, height)
    }
    if (isJPEG) {
      image = image.jpeg({
        progressive: true,
        quality: 80
      })
    }
    return res.end(await image.toBuffer())
  }

  return res.end(buffer)
}

