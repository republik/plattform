import { css } from 'glamor'
import React, { useEffect, useRef, useState } from 'react'
import colors from '../../theme/colors'
import { fontStyles } from '../../theme/fonts'

export const SHARE_IMAGE_WIDTH = 1200
export const SHARE_IMAGE_HEIGHT = 630
export const SHARE_IMAGE_PADDING = 48

const PLACEHOLDER_TEXT = 'Text für Sharebild'

const styles = {
  container: css({
    position: 'relative',
    width: SHARE_IMAGE_WIDTH,
    height: SHARE_IMAGE_HEIGHT,
    backgroundColor: '#000',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: SHARE_IMAGE_PADDING,
    overflow: 'hidden',
    wordWrap: 'break-word',
  }),
  kolumnenContainer: css({
    alignItems: 'flex-end',
  }),
  textContainer: css({
    width: '100%',
    maxHeight: SHARE_IMAGE_HEIGHT - 2 * SHARE_IMAGE_PADDING,
    overflow: 'hidden',
    whiteSpace: 'pre-wrap',
    textAlign: 'center',
    zIndex: 1,
  }),
  formatTitle: css({
    ...fontStyles.sansSerifMedium,
    marginBottom: 18,
    fontSize: 44,
    width: '100%',
    textAlign: 'center',
    zIndex: 1,
  }),
  formatImage: css({
    height: 260,
    zIndex: 1,
  }),
}

const formatFonts = {
  scribble: 'cursiveTitle',
  editorial: 'serifTitle',
  meta: 'sansSerifRegular',
}

const shareImageJustify = {
  top: 'flex-start',
  bottom: 'flex-end',
}

const SHARE_IMAGE_DEFAULTS = {
  customFontStyle: 'serifTitle',
  textPosition: 'bottom',
  fontSize: 56,
}

const ShareImagePreview = ({
  format,
  text,
  inverted,
  fontSize,
  textPosition,
}) => {
  const fontStyle = fontStyles[formatFonts[format?.kind] || 'serifTitle']
  const shareImage =
    format?.shareBackgroundImage &&
    (inverted
      ? format?.shareBackgroundImageInverted || format?.shareBackgroundImage
      : format?.shareBackgroundImage)
  const displayedText = !text || text === '' ? PLACEHOLDER_TEXT : text
  const formatColor = format?.color || colors[format?.kind]

  const [reservedVerticalSpace, setReservedVerticalSpace] = useState(0)
  const formatImageRef = useRef()
  const formatTitleRef = useRef()

  useEffect(() => {
    const formatImageHeight = format?.shareLogo
      ? formatImageRef.current.clientHeight
      : 0
    const formatTitleHeight = format?.title
      ? formatTitleRef.current.clientHeight
      : 0
    setReservedVerticalSpace(formatImageHeight + formatTitleHeight)
  }, [format])

  return (
    <div
      {...styles.container}
      {...(shareImage && styles.kolumnenContainer)}
      style={{
        backgroundImage: shareImage && `url(${shareImage})`,
        backgroundSize: 'cover',
        backgroundColor: inverted ? formatColor : '#FFF',
        justifyContent:
          (shareImage &&
            shareImageJustify[
              textPosition || SHARE_IMAGE_DEFAULTS.textPosition
            ]) ||
          'center',
      }}
    >
      {format?.shareLogo && !shareImage && (
        <img
          ref={formatImageRef}
          {...styles.formatImage}
          src={format?.shareLogo}
          alt=''
        />
      )}
      {format?.title && (
        <div
          ref={formatTitleRef}
          {...styles.formatTitle}
          style={{
            color: inverted ? '#FFF' : formatColor,
            width: shareImage && '80%',
          }}
        >
          {format.title}
        </div>
      )}
      <div
        {...styles.textContainer}
        style={{
          ...fontStyle,
          fontSize: fontSize || SHARE_IMAGE_DEFAULTS.fontSize,
          color: inverted ? '#FFF' : '#000',
          width: shareImage && '80%',
          lineHeight: 1.25,
          maxHeight:
            SHARE_IMAGE_HEIGHT -
            2 * SHARE_IMAGE_PADDING -
            reservedVerticalSpace,
        }}
      >
        {displayedText}
      </div>
    </div>
  )
}

export default ShareImagePreview
