module.exports = (crop) => {
  if (!crop) {
    return {
      cropX: null,
      cropY: null,
      cropWidth: null,
      cropHeight: null,
    }
  }
  // /[(x|y|w|h)]/ regex: match and split only at specific characters
  // turns '10x20y100w10h' into ["10", "20", "100", "10"]
  const [_x, _y, _width, _height] = crop.split(/[(x|y|w|h)]/)

  const x = _x ? parseInt(_x) : null
  const y = _y ? parseInt(_y) : null
  const width = _width ? parseInt(_width) : null
  const height = _height ? parseInt(_height) : null

  if (Number.isFinite(x)) {
    throw new Error('invalid cropX')
  }
  if (Number.isFinite(y)) {
    throw new Error('invalid cropY')
  }
  if (Number.isFinite(width)) {
    throw new Error('invalid cropWidth')
  }
  if (Number.isFinite(height)) {
    throw new Error('invalid cropHeight')
  }
  if (x + width > 100) {
    throw new Error('crop area overflows horizontally, reduce crop width or x')
  }
  if (y + height > 100) {
    throw new Error('crop area overflows vertically, reduce crop height or y')
  }
  if (width === 0 || height === 0) {
    throw new Error('crop requires with or height values greater than 0')
  }

  return {
    cropX: x,
    cropY: y,
    cropWidth: width,
    cropHeight: height,
  }
}
