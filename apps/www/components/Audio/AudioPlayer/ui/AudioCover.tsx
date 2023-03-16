import React from 'react'
import { css } from 'glamor'
import { AudioCoverGenerator } from '@project-r/styleguide'

type AudioCoverProps = {
  cover?: string
  size: number
  format?: any
  image?: string
  audioCoverCrop?: {
    x: number
    y: number
    width: number
    height: number
  }
  alt?: string
}

const styles = {
  cover: css({
    aspectRatio: '1 / 1',
    objectFit: 'cover',
    height: 'auto',
  }),
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

const AudioCover = ({
  cover,
  size,
  format,
  image: imageUrl,
  audioCoverCrop,
  alt = '',
}: AudioCoverProps) => {
  if (cover) {
    return (
      <img {...styles.cover} src={cover} style={{ width: size }} alt={alt} />
    )
  } else if (imageUrl) {
    const resizeUrl = getImageCropURL(imageUrl, size * 2, audioCoverCrop)

    return (
      <img
        src={resizeUrl || imageUrl}
        {...styles.cover}
        style={{ width: size }}
        alt={alt}
      />
    )
  }
  return <AudioCoverGenerator format={format} previewSize={size} />
}

export default AudioCover

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
  audioCoverCrop?: AudioCoverProps['audioCoverCrop'],
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
