import React from 'react'
import { css } from 'glamor'
import { mUp, tUp } from './mediaQueries'
import colors from '../../theme/colors'
import zIndex from '../../theme/zIndex'
import { FigureImage, FigureByline } from '../Figure'
import Text from './Text'

const containerStyle = {
  position: 'relative',
  lineHeight: 0,
  margin: 0,
  zIndex: zIndex.frontImage,
  [tUp]: {
    background: 'none',
  },
}

const styles = {
  container: css({
    ...containerStyle,
  }),
  containerFeuilleton: css({
    ...containerStyle,
    margin: '15px',
    [mUp]: {
      background: 'none',
      margin: '50px 5%',
    },
  }),
  textContainer: css({
    overflow: 'hidden', // Hides unpositioned content on mobile.
    padding: '15px 15px 40px 15px',
    [mUp]: {
      padding: '40px 15% 70px 15%',
    },
  }),
  textContainerFeuilleton: css({
    overflow: 'hidden', // Hides unpositioned content on mobile.
    padding: '15px 0 40px 0',
    [mUp]: {
      padding: '40px 0 70px 0',
    },
  }),
  textContainerOnTop: css({
    [tUp]: {
      padding: 0,
    },
  }),
}

/**
 * @typedef {object} ImageBlockProps
 * @property {React.ReactNode} children
 * @property {object} [attributes]
 * @property {string} image
 * @property {string} [byline]
 * @property {string} [alt]
 * @property {() => void} [onClick]
 * @property {string} [color]
 * @property {string} [bgColor]
 * @property {'topleft' | 'topright' | 'bottomleft' | 'bottomright' | 'top' | 'middle' | 'bottom' | 'underneath'} [textPosition]
 * @property {boolean} [center]
 * @property {boolean} [aboveTheFold]
 * @property {boolean} [onlyImage]
 * @property {boolean} [feuilleton]
 * @property {React.ReactNode} [audioPlayButton]
 */

/**
 * ImageBlock component
 * @param {ImageBlockProps} props
 * @returns {JSX.Element}
 */
const ImageBlock = ({
  children,
  attributes,
  image,
  maxWidth,
  byline,
  alt = '',
  onClick,
  color,
  bgColor,
  textPosition = 'topleft',
  center,
  aboveTheFold,
  onlyImage = false,
  feuilleton,
  audioPlayButton,
}) => {
  const background = bgColor || ''
  const isTextOnTop = textPosition !== 'underneath'

  return (
    <div
      {...attributes}
      {...(feuilleton ? styles.containerFeuilleton : styles.container)}
      onClick={onClick}
      style={{
        background,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div
        style={{
          position: 'relative',
          maxWidth,
          margin: maxWidth ? '0 auto' : undefined,
        }}
      >
        <div style={{ position: 'relative', fontSize: 0 }}>
          <FigureImage
            aboveTheFold={aboveTheFold}
            {...FigureImage.utils.getResizedSrcs(
              image,
              undefined,
              maxWidth || 1500,
              false,
            )}
            maxWidth={maxWidth}
            alt={alt}
          />
          {byline && (
            <FigureByline
              position={onlyImage ? 'leftInsideOnlyImage' : 'leftInside'}
              style={{ color }}
            >
              {byline}
            </FigureByline>
          )}
        </div>
        {!onlyImage && (
          <div
            {...(feuilleton
              ? styles.textContainerFeuilleton
              : styles.textContainer)}
            {...(isTextOnTop ? styles.textContainerOnTop : undefined)}
          >
            <Text
              position={isTextOnTop ? textPosition : undefined}
              color={color}
              collapsedColor={feuilleton && colors.text}
              center={center}
              feuilleton={feuilleton}
              audioPlayButton={audioPlayButton}
            >
              {children}
            </Text>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageBlock
