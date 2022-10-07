import React from 'react'
import { css } from 'glamor'
import { AudioCoverGenerator } from '@project-r/styleguide'
import { parse } from 'url'

type AudioCoverProps = {
  size: number
  format?: any
  image?: string
  audioCoverCrop?: {
    x: number
    y: number
    width: number
    height: number
  }
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
  const [w, h] = sizeString.split('x')

  if (w >= h) {
    return `x${size}`
  }

  return `${size}x`
}

const AudioCover = ({
  size,
  format,
  image: imageUrl,
  audioCoverCrop,
}: AudioCoverProps) => {
  if (imageUrl) {
    let resizeUrl
    if (audioCoverCrop) {
      const { x, y, width: w, height: h } = audioCoverCrop
      resizeUrl = `${imageUrl}&crop=${x}x${y}y${w}w${h}h&resize=${size * 2}x`
    } else {
      resizeUrl = `${imageUrl}&resize=${getResizefromURL(imageUrl, size * 2)}`
    }
    return (
      <img
        src={resizeUrl || imageUrl}
        {...styles.cover}
        style={{ width: size }}
        alt=''
      />
    )
  }
  return <AudioCoverGenerator format={format} previewSize={size} />
}

export default AudioCover
