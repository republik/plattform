import { css } from 'glamor'
import PropTypes from 'prop-types'
import React from 'react'
import { breakoutUp } from '../Center'
import { FigureByline, FigureImage } from '../Figure'
import LazyLoad from '../LazyLoad'
import { mUp } from './mediaQueries'
import Text from './Text'
import { useColorContext } from '../Colors/useColorContext'
import SwitchImage from '../Figure/SwitchImage'

const IMAGE_SIZE = {
  small: 220,
  medium: 300,
  large: 360,
}

export const sizeSmall = {
  maxHeight: `${IMAGE_SIZE.small}px`,
  maxWidth: `${IMAGE_SIZE.small}px`,
}

export const sizeMedium = {
  maxHeight: `${IMAGE_SIZE.medium}px`,
  maxWidth: `${IMAGE_SIZE.medium}px`,
}

export const sizeLarge = {
  maxHeight: `${IMAGE_SIZE.large}px`,
  maxWidth: `${IMAGE_SIZE.large}px`,
}

const styles = {
  textContainer: css({
    padding: 0,
    [mUp]: {
      padding: '0 13%',
      width: '100%',
    },
  }),
  imageContainer: css({
    margin: '0 auto 30px auto',
    [mUp]: {
      fontSize: 0, // Removes the small flexbox space.
    },
    [breakoutUp]: {
      margin: '0 auto 60px auto',
    },
  }),
  onlyImageContainer: css({
    margin: '0 auto',
    fontSize: 0,
    minHeight: '100px', // IE11
    width: '100%', // IE11
  }),
  image: css({
    minWidth: 100,
    ...sizeSmall,
    [mUp]: {
      ...sizeMedium,
    },
    [breakoutUp]: {
      ...sizeLarge,
    },
  }),
  onlyImage: css({
    minWidth: '100px',
    maxHeight: '100% !important',
    maxWidth: '100% !important',
  }),
}

const Tile = ({
  children,
  attributes,
  image,
  imageDark,
  byline,
  alt,
  onClick,
  color,
  bgColor,
  align,
  textLeft,
  aboveTheFold,
  onlyImage,
  singleColumn,
}) => {
  const [colorScheme] = useColorContext()
  const justifyContent =
    align === 'top' ? 'flex-start' : align === 'bottom' ? 'flex-end' : ''
  const imageProps =
    image && FigureImage.utils.getResizedSrcs(image, IMAGE_SIZE.large, false)
  const imageDarkProps =
    imageDark &&
    FigureImage.utils.getResizedSrcs(imageDark, IMAGE_SIZE.large, false)
  let containerStyle = {
    backgroundColor: bgColor,
    cursor: onClick ? 'pointer' : 'default',
    justifyContent,
    textAlign: textLeft ? 'left' : null,
  }

  if (onlyImage) {
    containerStyle.padding = 0
  }

  return (
    <div
      {...attributes}
      onClick={onClick}
      {...colorScheme.set('backgroundColor', 'default')}
      style={containerStyle}
      // The styles of the container are defined
      // on the parent component <TileRow />
      // with CSS children selectors, they depend
      // on the column number given as prop.
      className='tile'
    >
      {imageProps && (
        <div
          {...(onlyImage ? styles.onlyImageContainer : styles.imageContainer)}
        >
          <LazyLoad
            visible={aboveTheFold}
            consistentPlaceholder
            type='span'
            style={{
              position: 'relative',
              fontSize: 0,
              display: 'inline-block',
            }}
          >
            <SwitchImage
              src={imageProps.src}
              srcSet={imageProps.srcSet}
              dark={imageDarkProps}
              alt={alt}
              {...(onlyImage ? styles.onlyImage : styles.image)}
            />
            {byline && (
              <FigureByline position='rightCompact' style={{ color }}>
                {byline}
              </FigureByline>
            )}
          </LazyLoad>
        </div>
      )}
      {!onlyImage && (
        <div {...(singleColumn ? {} : styles.textContainer)}>
          <Text
            color={color}
            maxWidth={singleColumn ? undefined : '600px'}
            margin={'0 auto'}
          >
            {children}
          </Text>
        </div>
      )}
    </div>
  )
}

Tile.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  image: PropTypes.string,
  byline: PropTypes.string,
  alt: PropTypes.string,
  onClick: PropTypes.func,
  color: PropTypes.string,
  bgColor: PropTypes.string,
  align: PropTypes.oneOf(['top', 'middle', 'bottom']),
  aboveTheFold: PropTypes.bool,
  onlyImage: PropTypes.bool,
}

Tile.defaultProps = {
  alt: '',
}

export default Tile
