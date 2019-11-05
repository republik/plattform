import { css } from 'glamor'
import PropTypes from 'prop-types'
import React from 'react'
import { TeaserCarouselArticleCount } from '.'
import { FigureByline, FigureImage } from '../Figure'
import { mUp } from '../TeaserFront/mediaQueries'
import Text from '../TeaserFront/Text'
import { serifRegular16, serifRegular18 } from '../Typography/styles'

import CarouselContext from './Context'

import { TILE_MARGIN_RIGHT, TILE_MAX_WIDTH } from './constants'

const IMAGE_SIZE = {
  maxWidth: 160,
  maxHeight: 120
}

const styles = {
  tile: css({
    marginRight: TILE_MARGIN_RIGHT,
    textAlign: 'center',
    width: '33%',
    minWidth: 290,
    maxWidth: TILE_MAX_WIDTH,
    display: 'flex',
    justifyContent: 'center',
    ':last-of-type': { margin: 0 },
    ...serifRegular16,
    lineHeight: '22px',
    [mUp]: {
      ...serifRegular18,
      lineHeight: '24px',
      minWidth: 248
    }
  }),

  container: css({
    width: '100%' // IE11
  }),

  imageContainer: css({
    margin: '0 auto 14px auto',
    maxWidth: IMAGE_SIZE.maxWidth,
    width: 'auto',
    position: 'relative'
  }),
  imageContainerBigger: css({
    position: 'relative',
    margin: '0 auto 22px auto' // room for image credit below
  }),

  // custom styles for portrait images
  imageWrapper: css({
    position: 'relative',
    width: 'fit-content',
    margin: '0 auto'
  }),
  image: css({
    display: 'block',
    height: '100%',
    maxWidth: '100%',
    maxHeight: IMAGE_SIZE.maxHeight
  }),
  imageBigger: css({
    display: 'block',
    margin: '0 auto',
    maxWidth: '100%',
    objectFit: 'contain'
  })
}

const Tile = ({
  count,
  image,
  alt,
  onClick,
  aboveTheFold,
  byline,
  children,
  ...rest
}) => {
  const context = React.useContext(CarouselContext)

  const color = rest.color || context.color
  const bgColor = rest.bgColor || context.bgColor
  const outline = rest.outline || context.outline
  const bigger = rest.bigger || context.bigger

  const tileStyle = css(styles.tile, {
    border: outline ? `1px solid ${outline}` : 'none',
    color,
    backgroundColor: bgColor,
    cursor: onClick ? 'pointer' : 'default',
    padding: bigger ? '0 0 40px 0' : '30px 15px',
    alignItems: bigger ? 'flex-start' : 'center'
  })

  const containerStyle = css(styles.container, {
    margin: bigger ? '0' : '0 auto'
  })

  const imageProps = image && FigureImage.utils.getResizedSrcs(image, 450, true)
  const imageContainerStyles = bigger
    ? styles.imageContainerBigger
    : styles.imageContainer

  const imageStyles = bigger ? styles.imageBigger : styles.image

  const isPortrait =
    imageProps &&
    imageProps.size &&
    imageProps.size.width / imageProps.size.height <= 1
      ? true
      : false

  return (
    <div {...tileStyle} onClick={onClick} className='tile'>
      <div {...containerStyle}>
        {/* Image */}
        {imageProps && !isPortrait && (
          <div {...imageContainerStyles}>
            <FigureImage
              aboveTheFold={aboveTheFold}
              {...imageProps}
              alt={alt}
            />
            {byline && (
              <FigureByline
                position={bigger ? 'belowRight' : 'rightCompact'}
                style={{ color }}
              >
                {byline}
              </FigureByline>
            )}
          </div>
        )}
        {imageProps && isPortrait && (
          <div {...imageContainerStyles}>
            <div {...styles.imageWrapper}>
              <img
                {...imageStyles}
                src={imageProps.src}
                srcSet={imageProps.srcSet}
                alt={alt}
              />
              {byline && (
                <FigureByline
                  position={bigger ? 'aboveRight' : 'rightCompact'}
                  style={{ color }}
                >
                  {byline}
                </FigureByline>
              )}
            </div>
          </div>
        )}
        {/* Body */}
        <div>
          <Text color={color} margin={'0 auto'}>
            {children}
            {!!count && (
              <TeaserCarouselArticleCount
                count={count}
                bgColor={color}
                color={bgColor}
              />
            )}
          </Text>
        </div>
      </div>
    </div>
  )
}
export default Tile

Tile.propTypes = {
  bigger: PropTypes.bool,
  color: PropTypes.string,
  bgColor: PropTypes.string,
  outline: PropTypes.string,
  count: PropTypes.number,
  image: PropTypes.string,
  alt: PropTypes.string,
  onClick: PropTypes.func,
  aboveTheFold: PropTypes.bool,
  byline: PropTypes.string,
  children: PropTypes.node
}
