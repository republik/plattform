import { css } from 'glamor'
import React from 'react'
import { breakoutUp } from '../Center'
import { FigureImage } from '../Figure'
import LazyLoad from '../LazyLoad'
import { mUp } from '../TeaserFront/mediaQueries'
import Text from '../TeaserFront/Text'
import colors from '../../theme/colors'
import { TeaserFrontCarouselTitle, TeaserFrontCarouselArticleCount } from '.'
import { sansSerifRegular18 } from '../Typography/styles'

const IMAGE_SIZE = {
  small: { maxWidth: 160, maxHeight: 120 },
  medium: { maxWidth: 160, maxHeight: 120 },
  large: { maxWidth: 160, maxHeight: 120 }
}

// const sizeSmall = {
//   maxHeight: `${IMAGE_SIZE.small.height}px`,
//   maxWidth: `${IMAGE_SIZE.small.width}px`
// };

// const sizeMedium = {
//   maxHeight: `${IMAGE_SIZE.medium.height}px`,
//   maxWidth: `${IMAGE_SIZE.medium.width}px`
// };

// const sizeLarge = {
//   maxHeight: `${IMAGE_SIZE.large.height}px`,
//   maxWidth: `${IMAGE_SIZE.large.width}px`
// };

const styles = {
  carousel: css({
    margin: 0,
    padding: '30px 15px'
  }),

  carouselRow: css({
    margin: 0,
    display: 'flex',
    flexDirection: 'row',
    overflowX: 'scroll',
    flexWrap: 'nowrap'
  }),

  tile: css({
    margin: '0 7px 0 0',
    textAlign: 'center',
    padding: '30px 15px 40px 15px',
    minWidth: '300px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...sansSerifRegular18,
    ':last-of-type': { margin: 0 },
    [mUp]: {
      minWidth: '248'
    }
  }),

  container: css({
    margin: 'auto'
  }),

  imageContainer: css({
    // border: "1px solid blue",
    margin: '0 auto 14px auto',
    maxWidth: IMAGE_SIZE.large.maxWidth,
    maxHeight: IMAGE_SIZE.large.maxHeight
  }),
  image: css({
    // border: "1px solid red",
    height: '100%',
    maxWidth: '100%',
    maxHeight: IMAGE_SIZE.large.maxHeight,
    objectFit: 'scale-down'
  })
}

export const TeaserFrontCarousel = ({
  bgColor = '#FFF',
  color,
  format,
  children
}) => {
  // console.log(React.Children.count(children));
  const customStyles = css(styles.carousel, {
    backgroundColor: bgColor,
    color: color ? color : 'inherit'
  })

  return <section {...customStyles}>{children}</section>
}

export const TeaserFrontCarouselRow = ({ children }) => {
  return (
    <div role="group" {...styles.carouselRow}>
      {children}
    </div>
  )
}

const TeaserFrontCarouselTile = ({
  color = '#000',
  bgColor = 'none',
  noOutline = false,
  count,
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
    cursor: onClick ? 'pointer' : 'default'
  })

  return (
    <div {...tileStyle} onClick={onClick} className="tile">
      <div {...styles.container}>
        {/* Image */}
        {/* USE a <figure />? */}
        {imageProps && (
          <div {...styles.imageContainer}>
            <LazyLoad visible={aboveTheFold}>
              <img
                src={imageProps.src}
                srcSet={imageProps.srcSet}
                alt={alt}
                {...styles.image}
              />
            </LazyLoad>
          </div>
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
