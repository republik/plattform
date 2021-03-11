import React from 'react'
import { css } from 'glamor'
import { fontFamilies, fontStyles } from '../../theme/fonts'

const WIDTH = 1200
const HEIGHT = 628
const KOLUMNEN = ['Binswanger', 'Blickwechsel']
const KURSIVFORMATE = ['Aus der Arena', 'Ctrl-Alt-R', 'Happening']

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
    justifyContent: 'center',
    padding: 48,
    overflow: 'hidden'
  }),
  kolumnenContainer: css({
    justifyContent: 'flex-end',
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

const ShareImagePreview = ({
  format,
  text = 'Text für Social Image',
  coloredBackground,
  fontSize,
  fontStyle,
  textPosition,
  backgroundImage
}) => {
  return (
    <div
      {...styles.container}
      {...(format?.type === 'Kolumnen' &&
        backgroundImage &&
        styles.kolumnenContainer)}
      style={{
        backgroundImage: `url(${
          !backgroundImage
            ? ''
            : format?.backgroundImage && coloredBackground
            ? format?.backgroundImageColor
            : format?.backgroundImage
        })`,
        backgroundSize: 'cover',
        backgroundColor: coloredBackground ? format?.color : '#FFF',
        justifyContent:
          format?.type === 'Kolumnen' &&
          backgroundImage &&
          textPosition === 'top'
            ? 'flex-start'
            : format?.type === 'Kolumnen' &&
              backgroundImage &&
              textPosition === 'center' &&
              'center'
      }}
    >
      {KOLUMNEN.includes(format?.title) ? (
        <img {...styles.kolumnenImage} src={format?.image} />
      ) : format?.image ? (
        <img {...styles.formatImage} src={format?.image} />
      ) : null}
      {format?.title && (
        <div
          {...styles.formatTitle}
          style={{
            color: coloredBackground ? '#FFF' : format?.color,
            width: format?.type === 'Kolumnen' && backgroundImage && '80%'
          }}
        >
          {format.title}
        </div>
      )}
      <div
        {...styles.textContainer}
        style={{
          ...(fontStyle && fontStyle),
          ...(KURSIVFORMATE.includes(format?.title) && fontStyles.cursiveTitle),
          fontSize: fontSize,
          color: coloredBackground ? '#FFF' : '#000',
          width: format?.type === 'Kolumnen' && backgroundImage && '80%'
        }}
      >
        {text}
      </div>
    </div>
  )
}

export default ShareImagePreview
