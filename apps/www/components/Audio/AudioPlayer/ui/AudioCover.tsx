import React from 'react'
import { css } from 'glamor'
import { AudioCoverGenerator } from '@project-r/styleguide'
import {
  AudioCoverCropOptions,
  getImageCropURL,
} from '../../helpers/getImageCropURL'

type AudioCoverProps = {
  cover?: string
  size: number
  format?: any
  image?: string
  audioCoverCrop?: AudioCoverCropOptions
  alt?: string
}

const styles = {
  cover: css({
    aspectRatio: '1 / 1',
    objectFit: 'cover',
    height: 'auto',
  }),
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
