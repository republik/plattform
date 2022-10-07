import React from 'react'
import { css } from 'glamor'
import { AudioCoverGenerator, Spinner } from '@project-r/styleguide'
import { clamp } from '../../helpers/clamp'

type AudioCoverProps = {
  size: number
  /**
   * Multiplier to calculate the size of spinner
   * relative to the `size`-prop.
   */
  spinnerSizeRelation?: number
  format?: any
  image?: string
  audioCoverCrop?: {
    x: number
    y: number
    width: number
    height: number
  }
  isLoading?: boolean
}

const styles = {
  coverWrapper: css({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  cover: css({
    aspectRatio: '1 / 1',
    objectFit: 'cover',
    height: 'auto',
  }),
  spinner: css({
    position: 'absolute',
    inset: 0,
    background: 'rgba(50, 50, 50, 0.2)',
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
  spinnerSizeRelation = 0.5,
  format,
  image: imageUrl,
  audioCoverCrop,
  isLoading,
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
      <div {...styles.coverWrapper}>
        <img
          src={resizeUrl || imageUrl}
          {...styles.cover}
          style={{ width: size }}
          alt=''
        />
        {isLoading && (
          <div {...styles.spinner}>
            <Spinner
              size={Math.ceil(size * clamp(spinnerSizeRelation, 0, 1))}
              color='#999'
            />
          </div>
        )}
      </div>
    )
  }
  return <AudioCoverGenerator format={format} previewSize={size} />
}

export default AudioCover
