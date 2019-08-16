import { css } from 'glamor'
import PropTypes from 'prop-types'
import React from 'react'
import { TeaserCarouselArticleCount } from '.'
import colors from '../../theme/colors'
import { FigureByline, FigureImage } from '../Figure'
import { mUp } from '../TeaserFront/mediaQueries'
import Text from '../TeaserFront/Text'
import { sansSerifRegular18 } from '../Typography/styles'

const IMAGE_SIZE = {
  maxWidth: 160,
  maxHeight: 120
}

const styles = {
  tile: css({
    margin: '0 7px 0 0',
    textAlign: 'center',
    width: '33%',
    minWidth: 300,
    maxWidth: 450,
    display: 'flex',
    justifyContent: 'center',
    ...sansSerifRegular18,
    ':last-of-type': { margin: 0 },
    [mUp]: {
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
    position: 'relative',
    '& img': {
      maxHeight: IMAGE_SIZE.maxHeight,
      objectFit: 'contain'
    }
  }),

  imageContainerBigger: css({
    position: 'relative',
    margin: '15px auto' // room for image credit on top.
  }),

  image: css({
    height: '100%',
    maxWidth: '100%',
    maxHeight: IMAGE_SIZE.maxHeight
  }),

  imageBigger: css({
    maxWidth: '100%',
    objectFit: 'contain'
  })
}

const Tile = ({
  bigger,
  color = '#000',
  bgColor = 'unset',
  noOutline = false,
  count,
  image,
  alt,
  onClick,
  aboveTheFold,
  byline,
  children
}) => {
  let tileStyle = css(styles.tile, {
    border: noOutline ? 'none' : `1px solid ${colors.outline}`,
    color,
    backgroundColor: bgColor,
    cursor: onClick ? 'pointer' : 'default',
    padding: bigger ? '0 0 40px 0' : '30px 15px',
    alignItems: bigger ? 'flex-start' : 'center'
  })

  let containerStyle = css(styles.container, {
    margin: bigger ? '0' : '0 auto'
  })

  const imageProps = image && FigureImage.utils.getResizedSrcs(image, 450, true)
  let imageContainerStyles = bigger
    ? styles.imageContainerBigger
    : styles.imageContainer
  let imageStyles = bigger ? styles.imageBigger : styles.image

  return (
    <div {...tileStyle} onClick={onClick} className="tile">
      <div {...containerStyle}>
        {/* Image */}
        {imageProps && (
          <div {...imageContainerStyles}>
            <FigureImage
              aboveTheFold={aboveTheFold}
              src={imageProps.src}
              srcSet={imageProps.srcSet}
              alt={alt}
              maxWidth={bigger ? undefined : IMAGE_SIZE.maxWidth}
              {...imageStyles}
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
        )}
        {/* Body */}
        <div>
          <Text color={color} margin={'0 auto'}>
            {children}
            {count && (
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
  noOutline: PropTypes.bool,
  count: PropTypes.number,
  image: PropTypes.string,
  alt: PropTypes.string,
  onClick: PropTypes.func,
  aboveTheFold: PropTypes.bool,
  byline: PropTypes.string,
  children: PropTypes.node
}

Tile.defaultProps = {
  color: '#000',
  bgColor: 'unset',
  noOutline: false
}
