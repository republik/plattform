import React, { useRef, useEffect, useState } from 'react'
import { css } from 'glamor'
import { fontStyles } from '../../theme/fonts'
import colors from '../../theme/colors'
import { relative } from 'path'

export const COVER_IMAGE_WIDTH = 1080
export const COVER_IMAGE_HEIGHT = 1080
export const COVER_IMAGE_PADDING = 90
const COVER_PREVIEW_WIDTH = 300

const styles = {
  container: css({
    position: 'relative',
    width: COVER_IMAGE_WIDTH,
    height: COVER_IMAGE_HEIGHT,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'hidden',
    wordWrap: 'break-word',
    transform: `scale(${COVER_PREVIEW_WIDTH / COVER_IMAGE_WIDTH})`,
    transformOrigin: '0 0',
    marginBottom:
      -COVER_IMAGE_HEIGHT * (1 - COVER_PREVIEW_WIDTH / COVER_IMAGE_WIDTH),
  }),
  textContainer: css({
    width: '100%',
    maxHeight: COVER_IMAGE_HEIGHT - 2 * COVER_IMAGE_PADDING,
    overflow: 'hidden',
    whiteSpace: 'pre-wrap',
    textAlign: 'center',
    zIndex: 1,
  }),
  formatTitle: css({
    ...fontStyles.sansSerifMedium,
    marginBottom: 18,
    fontSize: 172,
    width: '100%',
    textAlign: 'center',
    zIndex: 1,
  }),
  formatBg: css({
    position: 'absolute',
    height: '100%',
    width: '100%',
  }),
  errorLabel: css({}),
}

export const COVER_IMAGE_DEFAULTS = {
  customFontStyle: 'serifTitle',
  textPosition: 'bottom',
  fontSize: 56,
}

type Format = {
  title: string
  section: {
    meta: {
      title: string
    }
  }
  color: string
  shareBackgroundImage: string
  shareBackgroundImageInverted: string
  shareLogo: string
  kind: 'scribble' | 'flyer'
}

type AudioCoverProps = {
  format: Format
  image: string
  previewSize: number
  croppedArea?: {
    x: number // x/y are the coordinates of the top/left corner of the cropped area
    y: number
    width: number // width of the cropped area
    height: number // height of the cropped area
  }
}

const AudioCover = ({
  format,
  image,
  croppedArea,
  previewSize = COVER_PREVIEW_WIDTH,
}: AudioCoverProps) => {
  console.log(croppedArea)
  const formatImage =
    format?.shareBackgroundImageInverted || format?.shareBackgroundImage
  const formatColor = format?.color || colors[format?.kind]

  const scale = croppedArea?.width ? 100 / croppedArea.width : 1
  const transform = {
    x: `${croppedArea?.x ? -croppedArea.x * scale : 0}%`,
    y: `${croppedArea?.y ? -croppedArea.y * scale : 0}%`,
    scale,
    width: 'calc(100% + 0.5px)',
    height: 'auto',
  }

  const imageStyle = {
    transform: `translate3d(${transform.x}, ${transform.y}, 0) scale3d(${transform.scale},${transform.scale},1)`,
    width: transform.width,
    height: transform.height,
    transformOrigin: 'top left',
  }

  if (image) {
    return (
      <div
        {...styles.container}
        style={{
          transform: `scale(${previewSize / COVER_IMAGE_WIDTH})`,
          marginBottom:
            -COVER_IMAGE_HEIGHT * (1 - previewSize / COVER_IMAGE_WIDTH),
          paddingBottom: '100%',
        }}
      >
        <img src={image} alt='' style={imageStyle} />
      </div>
    )
  }

  if (formatImage) {
    return (
      <div
        {...styles.container}
        style={{
          backgroundImage: `url(${formatImage})`,
          backgroundSize: 'cover',
        }}
      >
        <img src={image} alt='' style={imageStyle} />
      </div>
    )
  }

  return (
    <>
      <div
        {...styles.container}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {format?.shareLogo ? (
          <img src={format?.shareLogo} style={{ zIndex: 3 }} alt='' />
        ) : (
          format?.title && (
            <div {...styles.formatTitle} {...css({ color: formatColor })}>
              {format.title}
            </div>
          )
        )}
        <div
          {...styles.formatBg}
          style={{
            backgroundColor: formatColor,
            opacity: 0.05,
            zIndex: 1,
          }}
        />
        <div
          {...styles.formatBg}
          style={{
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }}
        />
      </div>
    </>
  )
}

export default AudioCover
