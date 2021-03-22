import React from 'react'
import { css } from 'glamor'
import { fontFamilies, fontStyles } from '../../theme/fonts'
import { imageStyle } from './SharePreviewTwitter'

const WIDTH = 1200
const HEIGHT = 628

const imageStyles = {
  twitter: imageStyle
}

const styles = {
  container: css({
    transform: `scale(${0.5})`,
    transformOrigin: '0 0',
    marginBottom: -HEIGHT / 2,
    position: 'relative',
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: '#000',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 48,
    overflow: 'hidden'
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

const columnImageJustify = {
  top: 'flex-start',
  bottom: 'flex-end'
}

const ShareImagePreview = ({
  format,
  text,
  fontSize,
  coloredBackground,
  backgroundImage,
  textPosition,
  customFontStyle,
  placeholderText,
  socialKey
}) => {
  const fontStyleKey = customFontStyle || formatFonts[format?.kind]
  const fontStyle = fontStyles[fontStyleKey]
  const isColumn = format?.type === 'Kolumnen'
  const columnImage =
    isColumn &&
    backgroundImage &&
    (coloredBackground ? format?.shareImageColor : format?.shareImage)
  const displayedText = !text || text === '' ? placeholderText : text

  return (
    <div
      {...styles.container}
      {...imageStyles[socialKey]}
      {...(columnImage && styles.kolumnenContainer)}
      style={{
        backgroundImage: columnImage && `url(${columnImage})`,
        backgroundSize: 'cover',
        backgroundColor: coloredBackground ? format?.color : '#FFF',
        justifyContent:
          (columnImage && columnImageJustify[textPosition]) || 'center'
      }}
    >
      {format?.image && <img {...styles.formatImage} src={format?.image} />}
      {format?.title && (
        <div
          {...styles.formatTitle}
          style={{
            color: coloredBackground ? '#FFF' : format?.color,
            width: columnImage && '80%'
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
          width: columnImage && '80%'
        }}
      >
        {displayedText}
      </div>
    </div>
  )
}

export default ShareImagePreview
