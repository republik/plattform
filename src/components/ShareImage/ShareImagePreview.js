import React from 'react'
import { css } from 'glamor'
import { fontFamilies, fontStyles } from '../../theme/fonts'
import { imageStyle } from './SharePreviewTwitter'
import { hasCustomFontStyle } from './index'

export const SHARE_IMAGE_WIDTH = 1200
export const SHARE_IMAGE_HEIGHT = 628

export const socialPreviewStyles = {
  twitter: imageStyle
}

const styles = {
  container: css({
    position: 'relative',
    width: SHARE_IMAGE_WIDTH,
    height: SHARE_IMAGE_HEIGHT,
    backgroundColor: '#000',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 48,
    overflow: 'hidden'
  }),
  containerHalfSize: css({
    transform: `scale(${0.5})`,
    transformOrigin: '0 0',
    marginBottom: -SHARE_IMAGE_HEIGHT / 2
  }),
  kolumnenContainer: css({
    alignItems: 'flex-end'
  }),
  textContainer: css({
    width: '100%',
    whiteSpace: 'pre-wrap',
    textAlign: 'center',
    fontFamily: fontFamilies.serifBold,
    fontWeight: 700,
    zIndex: 1
  }),
  formatTitle: css({
    fontFamily: fontFamilies.sansSerifMedium,
    marginBottom: 18,
    fontSize: 44,
    width: '100%',
    textAlign: 'center',
    zIndex: 1
  }),
  formatImage: css({
    height: 260,
    zIndex: 1
  })
}

const formatFonts = {
  scribble: 'cursiveTitle',
  editorial: 'serifBold',
  meta: 'sansSerifRegular'
}

const shareImageJustify = {
  top: 'flex-start',
  bottom: 'flex-end'
}

export const SHARE_IMAGE_DEFAULTS = {
  customFontStyle: 'serifBold',
  textPosition: 'bottom',
  fontSize: 60
}

const ShareImagePreview = ({
  format,
  text,
  coloredBackground,
  illuBackground,
  placeholderText,
  socialKey,
  embedPreview,
  customFontStyle = SHARE_IMAGE_DEFAULTS.customFontStyle,
  textPosition = SHARE_IMAGE_DEFAULTS.position,
  fontSize = SHARE_IMAGE_DEFAULTS.fontSize
}) => {
  const fontStyleKey = hasCustomFontStyle(format)
    ? customFontStyle
    : formatFonts[format?.kind]
  const fontStyle = fontStyles[fontStyleKey]
  const shareImage =
    illuBackground &&
    (coloredBackground
      ? format?.shareImageColor || format?.shareImage
      : format?.shareImage)
  const displayedText = !text || text === '' ? placeholderText : text

  return (
    <div
      {...styles.container}
      {...(placeholderText && styles.containerHalfSize)}
      {...(embedPreview && socialPreviewStyles[socialKey])}
      {...(shareImage && styles.kolumnenContainer)}
      style={{
        backgroundImage: shareImage && `url(${shareImage})`,
        backgroundSize: 'cover',
        backgroundColor: coloredBackground ? format?.color : '#FFF',
        justifyContent:
          (shareImage && shareImageJustify[textPosition]) || 'center',
        borderWidth: embedPreview ? 2 : 0
      }}
    >
      {format?.image && <img {...styles.formatImage} src={format?.image} />}
      {format?.title && (
        <div
          {...styles.formatTitle}
          style={{
            color: coloredBackground ? '#FFF' : format?.color,
            width: shareImage && '80%'
          }}
        >
          {format.title}
        </div>
      )}
      <div
        {...styles.textContainer}
        style={{
          ...(fontStyle && fontStyle),
          fontSize,
          color: coloredBackground ? '#FFF' : '#000',
          width: shareImage && '80%'
        }}
      >
        {displayedText}
      </div>
    </div>
  )
}

export default ShareImagePreview
