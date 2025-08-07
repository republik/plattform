import { Crop } from '#graphql/republik-api/__generated__/gql/graphql'
import { CDN_FRONTEND_BASE_URL } from '../../../lib/constants'

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
 * @param crop crop parameters
 * @returns image url with crop and resize parameters
 */
export function getImageCropURL(
  imageUrl: string | undefined,
  size: number,
  crop?: Crop,
) {
  if (!imageUrl) {
    return CDN_FRONTEND_BASE_URL + '/static/audioplayer-fallback.png'
  }
  const url = new URL(imageUrl)
  if (!url.searchParams.has('size')) {
    url.searchParams.set('size', `${size}x${size}`)
  }
  if (crop) {
    const { x, y, width: w, height: h } = crop
    url.searchParams.set('crop', `${x}x${y}y${w}w${h}h`)
    url.searchParams.set('resize', `${size}x`)
  } else {
    url.searchParams.set('resize', getResizefromURL(imageUrl, size))
  }
  return url.toString()
}
