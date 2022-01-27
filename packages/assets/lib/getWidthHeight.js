const maxSize = 6000

module.exports = (resize) => {
  if (!resize) {
    return {
      width: null,
      height: null,
    }
  }

  // some browser seem to erroneous append the srcset info to resize, e.g. "503x 503w" (XXXw is data designated for the browser)
  // - workaround: ignore everything after the first space in resize
  const [_width, _height] = resize.split(' ')[0].split('x')

  const width = _width ? Math.ceil(Math.abs(_width)) : null
  const height = _height ? Math.ceil(Math.abs(_height)) : null
  if (isNaN(width) || (width && typeof width !== 'number')) {
    throw new Error('invalid width')
  }
  if (isNaN(height) || (height && typeof height !== 'number')) {
    throw new Error('invalid height')
  }
  if (width > maxSize || height > maxSize) {
    throw new Error('maxSize: ' + maxSize)
  }
  return {
    width,
    height,
  }
}
