/**
 * Get the width of an image based on it's size and the displayWidth
 * @param size
 * @param displayWidth
 * @param fill
 * @returns {string}
 */
export function getImageSize({ size = '', displayWidth, fill }) {
  switch (size) {
    case 'tiny':
      return '325px'
    default:
      if (fill) return '100%'
      return displayWidth
  }
}

export function isPixelSize(value) {
  return /^([0-9]+)px$/.test(value)
}

export function isRelativeSize(value) {
  return /^([0-9]+)%$/.test(value)
}
