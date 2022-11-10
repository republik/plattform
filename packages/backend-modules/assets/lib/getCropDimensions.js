// turns '10x20y100w10h' into { x: '10', y: '20', w: '100', h: '10' }
// using named groups in regular expression
const cropPattern = /^(?<x>\d{1,3})x(?<y>\d{1,3})y(?<w>\d{1,3})w(?<h>\d{1,3})h$/

module.exports = (crop) => {
  if (!crop) {
    return {
      cropX: null,
      cropY: null,
      cropWidth: null,
      cropHeight: null,
    }
  }

  const groups = crop.match(cropPattern)?.groups
  if (!groups) {
    throw new Error('invalid crop string')
  }

  const cropX = +groups.x
  const cropY = +groups.y
  const cropWidth = +groups.w
  const cropHeight = +groups.h

  if (cropX + cropWidth > 100) {
    throw new Error('crop area overflows horizontally, reduce crop width or x')
  }
  if (cropY + cropHeight > 100) {
    throw new Error('crop area overflows vertically, reduce crop height or y')
  }
  if (cropWidth === 0 || cropHeight === 0) {
    throw new Error('crop requires width or height values greater than 0')
  }

  return {
    cropX,
    cropY,
    cropWidth,
    cropHeight,
  }
}
