export type AudioCoverPropsOptions = {
  x: number
  y: number
  width: number
  height: number
}

const getResizefromURL = (url, size) => {
  const imgURL = new URL(url)
  const sizeString = imgURL.searchParams.get('size')
  if (!sizeString) {
    return `${size}x`
  }

  const [w, h] = sizeString.split('x')

  if (w >= h) {
    return `x${size}`
  }

  return `${size}x`
}

/**
 * Get a resized and cropped image url
 * @param imageUrl image to crop
 * @param size defines the width and height of the image
 * @param audioCoverCrop crop parameters
 * @returns image url with crop and resize parameters
 */
export function getImageCropURL(
  imageUrl: string,
  size: number,
  audioCoverCrop?: AudioCoverPropsOptions,
) {
  const url = new URL(imageUrl)
  if (!url.searchParams.has('size')) {
    url.searchParams.set('size', `${size}x${size}`)
  }
  if (audioCoverCrop) {
    const { x, y, width: w, height: h } = audioCoverCrop
    url.searchParams.set('crop', `${x}x${y}y${w}w${h}h`)
    url.searchParams.set('resize', `${size}x`)
  } else {
    url.searchParams.set('resize', getResizefromURL(imageUrl, size))
  }
  return url.toString()
}
