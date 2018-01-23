const sharp = require('sharp')

module.exports.toJPEG = (buffer) => {
  return sharp(buffer)
    .rotate()
    .jpeg({
      quality: 100
    })
    .toBuffer()
}
