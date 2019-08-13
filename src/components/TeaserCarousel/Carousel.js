import { css } from 'glamor'
import React from 'react'
import { FigureImage } from '../Figure'
import LazyLoad from '../LazyLoad'
import { mUp } from '../TeaserFront/mediaQueries'
import Text from '../TeaserFront/Text'
import colors from '../../theme/colors'
import { TeaserFrontCarouselArticleCount } from '.'
import { sansSerifRegular18 } from '../Typography/styles'

const IMAGE_SIZE = {
  small: { maxWidth: 160, maxHeight: 120 },
  medium: { maxWidth: 160, maxHeight: 120 },
  large: { maxWidth: 160, maxHeight: 120 }
}

const styles = {
  carousel: css({
    margin: 0,
    padding: '30px 15px',
    overflow: 'auto'
  }),

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
    maxHeight: IMAGE_SIZE.large.maxHeight
  }),

  imageContainerBigger: css({
    margin: '0 auto'
  }),

  image: css({
    height: '100%',
    maxWidth: '100%',
    maxHeight: IMAGE_SIZE.large.maxHeight,
    objectFit: 'scale-down'
  }),

  imageBigger: css({
    maxWidth: '100%',
    objectFit: 'scale-down'
  })
}

export const TeaserFrontCarousel = ({ bgColor = '#FFF', color, children }) => {
  const customStyles = css(styles.carousel, {
    backgroundColor: bgColor,
    color: color ? color : 'inherit'
  })

  return <section {...customStyles}>{children}</section>
}

const TeaserFrontCarouselTile = ({
  color = '#000',
  bgColor = 'unset',
  noOutline = false,
  count,
  bigger,
  image,
  alt,
  onClick,
  aboveTheFold,
  children
}) => {
  const imageProps =
    image && FigureImage.utils.getResizedSrcs(image, IMAGE_SIZE.small, false)
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
  let imageContainerStyles = bigger
    ? styles.imageContainerBigger
    : styles.imageContainer
  let imageStyles = bigger ? styles.imageBigger : styles.image

  return (
    <div {...tileStyle} onClick={onClick} className="tile">
      <div {...containerStyle}>
        {/* Image */}
        {imageProps && (
          <figure {...imageContainerStyles}>
            <LazyLoad visible={aboveTheFold}>
              <img
                src={imageProps.src}
                srcSet={imageProps.srcSet}
                alt={alt}
                {...imageStyles}
              />
            </LazyLoad>
          </figure>
        )}

        {/* Body */}
        <div>
          <Text color={color} margin={'0 auto'}>
            {children}
            {count && (
              <TeaserFrontCarouselArticleCount
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
export default TeaserFrontCarouselTile
