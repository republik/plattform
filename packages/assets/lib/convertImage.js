const sharp = require('sharp')

module.exports.toJPEG = async (buffer) => {
  const image = sharp(buffer)
    .rotate()
    .jpeg({
      quality: 100
    })
  return {
    meta: await image.metadata(),
    data: await image.toBuffer()
  }
}
