import { css } from 'glamor'
import PropTypes from 'prop-types'
import React from 'react'
import { breakoutUp } from '../Center'
import { FigureByline, FigureImage } from '../Figure'
import LazyLoad from '../LazyLoad'
import { mUp } from './mediaQueries'
import Text from './Text'

export const IMAGE_SIZE = {
  small: 220,
  medium: 300,
  large: 360
}

export const sizeSmall = {
  maxHeight: `${IMAGE_SIZE.small}px`,
  maxWidth: `${IMAGE_SIZE.small}px`
}

export const sizeMedium = {
  maxHeight: `${IMAGE_SIZE.medium}px`,
  maxWidth: `${IMAGE_SIZE.medium}px`
}

export const sizeLarge = {
  maxHeight: `${IMAGE_SIZE.large}px`,
  maxWidth: `${IMAGE_SIZE.large}px`
}

const styles = {
  container: css({
    margin: '0 auto',
    textAlign: 'center',
    padding: '30px 15px 40px 15px',
    width: '100%',
    [mUp]: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 0'
    }
  }),
  textContainer: css({
    padding: 0,
    [mUp]: {
      padding: '0 13%',
      width: '100%'
    }
  }),
  imageContainer: css({
    margin: '0 auto 30px auto',
    [mUp]: {
      fontSize: 0 // Removes the small flexbox space.
    },
    [breakoutUp]: {
      margin: '0 auto 60px auto'
    }
  }),
  onlyImageContainer: css({
    margin: '0 auto',
    fontSize: 0,
    minHeight: '100px', // IE11
    width: '100%' // IE11
  }),
  image: css({
    minWidth: '100px',
    ...sizeSmall,
    [mUp]: {
      ...sizeMedium
    },
    [breakoutUp]: {
      ...sizeLarge
    }
  }),
  onlyImage: css({
    minWidth: '100px',
    maxHeight: '100% !important',
    maxWidth: '100% !important'
  })
}

const Tile = ({
  children,
  attributes,
  image,
  byline,
  alt,
  onClick,
  color,
  bgColor,
  align,
  aboveTheFold,
  onlyImage
}) => {
  const background = bgColor || ''
  const justifyContent =
    align === 'top' ? 'flex-start' : align === 'bottom' ? 'flex-end' : ''
  const imageProps =
    image && FigureImage.utils.getResizedSrcs(image, IMAGE_SIZE.large, false)
  let containerStyle = {
    background,
    cursor: onClick ? 'pointer' : 'default',
    justifyContent
  }
  if (onlyImage) {
    containerStyle.padding = 0
  }

  return (
    <div
      {...attributes}
      {...styles.container}
      onClick={onClick}
      style={containerStyle}
      className="tile"
    >
      {imageProps && (
        <div
          {...(onlyImage ? styles.onlyImageContainer : styles.imageContainer)}
        >
          <LazyLoad
            visible={aboveTheFold}
            style={{ position: 'relative', fontSize: 0 }}
          >
            <img
              src={imageProps.src}
              srcSet={imageProps.srcSet}
              alt={alt}
              {...(onlyImage ? styles.onlyImage : styles.image)}
            />
            {byline && (
              <FigureByline position="rightCompact" style={{ color }}>
                {byline}
              </FigureByline>
            )}
          </LazyLoad>
        </div>
      )}
      {!onlyImage && (
        <div {...styles.textContainer}>
          <Text color={color} maxWidth={'600px'} margin={'0 auto'}>
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
  color: PropTypes.string,
  bgColor: PropTypes.string,
  align: PropTypes.oneOf(['top', 'middle', 'bottom']),
  aboveTheFold: PropTypes.bool,
  onlyImage: PropTypes.bool
}

Tile.defaultProps = {
  alt: ''
}

export default Tile
