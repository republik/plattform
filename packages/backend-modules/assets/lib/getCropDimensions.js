module.exports = (crop) => {
  if (!crop) {
    return {
      x: null,
      y: null,
      width: null,
      height: null,
    }
  }
  // /[^0-9]/ regex: match non-numeric values
  // turns '10x20y100w10h' into ["10", "20", "100", "10", ""] and removes the last value
  const [_x, _y, _width, _height] = crop.split(/[^0-9]/).slice(0, -1)
  const x = _x ? Math.ceil(Math.abs(_x)) : null
  const y = _y ? Math.ceil(Math.abs(_y)) : null
  const width = _width ? Math.ceil(Math.abs(_width)) : null
  const height = _height ? Math.ceil(Math.abs(_height)) : null

  if (isNaN(x) || (x && typeof x !== 'number')) {
    throw new Error('invalid width')
  }
  if (isNaN(y) || (y && typeof y !== 'number')) {
    throw new Error('invalid width')
  }
  if (isNaN(width) || (width && typeof width !== 'number')) {
    throw new Error('invalid width')
  }
  if (isNaN(height) || (height && typeof height !== 'number')) {
    throw new Error('invalid height')
  }

  return {
    cropX: x,
    cropY: y,
    cropWidth: width,
    cropHeight: height,
  }
}
