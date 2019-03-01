const maxSize = 6000

module.exports = (resize) => {
  if (!resize) {
    return {
      width: null,
      height: null
    }
  }
  const [_width, _height] = resize.split('x')
  const width = _width ? Math.ceil(Math.abs(_width)) : null
  const height = _height ? Math.ceil(Math.abs(_height)) : null
  if (width && (typeof (width) !== 'number' || isNaN(width))) {
    throw new Error('invalid width')
  }
  if (height && (typeof (height) !== 'number' || isNaN(height))) {
    throw new Error('invalid height')
  }
  if (width > maxSize || height > maxSize) {
    throw new Error('maxSize: ' + maxSize)
  }
  return {
    width,
    height
  }
}
