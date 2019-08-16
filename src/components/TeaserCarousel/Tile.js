import { imageSizeInfo, imageResizeUrl } from 'mdast-react-render/lib/utils'
import { css } from 'glamor'
import React from 'react'
import { TeaserCarouselArticleCount } from '.'
import colors from '../../theme/colors'
import { FigureImage, Figure, FigureCaption, FigureByline } from '../Figure'
import LazyLoad from '../LazyLoad'
import { mUp } from '../TeaserFront/mediaQueries'
import Text from '../TeaserFront/Text'
import { sansSerifRegular18 } from '../Typography/styles'

// FIXME: we don't need all of these:
const IMAGE_SIZE = {
  small: { maxWidth: 160, maxHeight: 120 },
  medium: { maxWidth: 160, maxHeight: 120 },
  large: { maxWidth: 160, maxHeight: 120 }
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
    width: '100%' // IE11 needs this
  }),

  imageContainer: css({
    margin: '0 auto 14px auto',
    maxWidth: IMAGE_SIZE.large.maxWidth,
    width: 'auto',
    position: 'relative',
    '& img': {
      maxHeight: IMAGE_SIZE.large.maxHeight,
      objectFit: 'contain'
    }
  }),

  imageContainerBigger: css({
    position: 'relative',
    margin: '15px auto' // room for image credit on top. FIXME: only margin top when there IS a byline
  }),

  image: css({
    height: '100%',
    maxWidth: '100%',
    maxHeight: IMAGE_SIZE.large.maxHeight
  }),

  imageBigger: css({
    maxWidth: '100%',
    objectFit: 'contain'
  })
}

const TeaserCarouselTile = ({
  color = '#000',
  bgColor = 'unset',
  noOutline = false,
  count,
  bigger,
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

  const imageProps =
    image &&
    FigureImage.utils.getResizedSrcs(image, IMAGE_SIZE.small.maxWidth, true)
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
              maxWidth={bigger ? undefined : IMAGE_SIZE.small.maxWidth}
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
export default TeaserCarouselTile
