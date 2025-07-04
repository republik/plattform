import { css } from 'glamor'
import { relative } from 'path'
import React from 'react'
import colors from '../../theme/colors'
import { fontStyles } from '../../theme/fonts'

export const COVER_IMAGE_WIDTH = 1080
export const COVER_IMAGE_HEIGHT = 1080
export const COVER_IMAGE_PADDING = 90
const COVER_PREVIEW_WIDTH = 300

const styles = {
  container: css({
    position: 'relative',
    width: COVER_IMAGE_WIDTH,
    minWidth: COVER_IMAGE_WIDTH,
    height: COVER_IMAGE_HEIGHT,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'hidden',
    wordWrap: 'break-word',
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
  fallBack: css({
    ...fontStyles.serifTitle,
    fontSize: 800,
    textAlign: 'center',
    zIndex: 1,
    color: '#fff',
    paddingTop: 185,
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
  kind: 'scribble'
}

type AudioCoverProps = {
  format: Format
  previewSize: number
}

const AudioCover = ({
  format,
  previewSize = COVER_PREVIEW_WIDTH,
}: AudioCoverProps) => {
  const formatBackgroundImage =
    format?.shareBackgroundImageInverted || format?.shareBackgroundImage
  const formatColor = format?.color || colors[format?.kind]

  if (formatBackgroundImage) {
    return (
      <div
        style={{
          width: previewSize,
          height: previewSize,
          backgroundImage: `url(${formatBackgroundImage})`,
          backgroundSize: 'cover',
        }}
      />
    )
  }

  return (
    <div style={{ width: previewSize, height: previewSize }}>
      <div
        {...styles.container}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transform: `scale(${previewSize / COVER_IMAGE_WIDTH})`,
          transformOrigin: '0 0',
          marginBottom:
            -COVER_IMAGE_HEIGHT * (1 - previewSize / COVER_IMAGE_WIDTH),
        }}
      >
        {format?.shareLogo ? (
          <img src={format?.shareLogo} style={{ zIndex: 3 }} alt='' />
        ) : format?.title ? (
          <div {...styles.formatTitle} {...css({ color: formatColor })}>
            {format.title}
          </div>
        ) : (
          <span {...styles.fallBack}>R</span>
        )}
        {formatColor && (
          <div
            {...styles.formatBg}
            style={{
              backgroundColor: formatColor,
              opacity: 0.05,
              zIndex: 1,
            }}
          />
        )}

        <div
          {...styles.formatBg}
          style={{
            backgroundColor: formatColor ? '#F5F5F5' : '#000000',
            zIndex: 0,
          }}
        />
      </div>
    </div>
  )
}

export default AudioCover
