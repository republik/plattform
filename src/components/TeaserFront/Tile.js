import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { mUp, tUp } from './mediaQueries'
import Text from './Text'
import colors from '../../theme/colors'

import { FigureImage } from '../Figure'
import LazyLoad from '../LazyLoad'

const IMAGE_SIZE = {
  tiny: 180,
  small: 220,
  medium: 300,
  large: 360
}

const sizeTiny = {
  maxHeight: `${IMAGE_SIZE.tiny}px`,
  maxWidth: `${IMAGE_SIZE.tiny}px`
}

const sizeSmall = {
  maxHeight: `${IMAGE_SIZE.small}px`,
  maxWidth: `${IMAGE_SIZE.small}px`
}

const sizeMedium = {
  maxHeight: `${IMAGE_SIZE.medium}px`,
  maxWidth: `${IMAGE_SIZE.medium}px`
}

const sizeLarge = {
  maxHeight: `${IMAGE_SIZE.large}px`,
  maxWidth: `${IMAGE_SIZE.large}px`
}

const styles = {
  container: css({
    margin: '0 auto',
    textAlign: 'center',
    padding: '30px 15px',
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
    [tUp]: {
      margin: '0 auto 60px auto'
    }
  }),
  onlyImageContainer: css({
    margin: '0 auto',
    fontSize: 0
  }),
  image: css({
    minWidth: '100px',
    ...sizeSmall,
    [mUp]: {
      ...sizeMedium
    },
    [tUp]: {
      ...sizeLarge
    }
  }),
  onlyImage: css({
    minWidth: '100px',
    maxHeight: '100% !important',
    maxWidth: '100% !important'
  }),
  row: css({
    margin: 0,
    display: 'block',
    [mUp]: {
      display: 'flex'
    }
  }),
  col2: css({
    [mUp]: {
      '& .tile': {
        width: '50%'
      },
      '& img': {
        ...sizeSmall
      }
    },
    [tUp]: {
      '& img': {
        ...sizeMedium
      }
    }
  }),
  col3: css({
    '& .tile': {
      borderTop: `1px solid ${colors.divider}`
    },
    [mUp]: {
      display: 'flex',
      flexFlow: 'row wrap',
      '& .tile': {
        width: '33.3%',
        borderTop: 'none',
        borderLeft: `1px solid ${colors.divider}`,
        margin: '0 0 50px 0',
        padding: '20px 0'
      },
      '& .tile:nth-child(3n+1)': {
        borderLeft: 'none'
      },
      '& img': {
        ...sizeTiny
      }
    },
    [tUp]: {
      '& img': {
        ...sizeSmall
      }
    }
  })
}

export const TeaserFrontTileRow = ({
  children,
  attributes,
  columns
}) => {
  return (
    <div
      role="group"
      {...attributes}
      {...styles.row}
      {...styles[`col${columns}`]}
    >
      {children}
    </div>
  )
}

TeaserFrontTileRow.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  columns: PropTypes.oneOf([1, 2, 3]).isRequired
}

TeaserFrontTileRow.defaultProps = {
  columns: 1
}

const Tile = ({
  children,
  attributes,
  image,
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
  const imageProps = image && FigureImage.utils.getResizedSrcs(
    image,
    IMAGE_SIZE.large,
    false
  )
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
      className='tile'
    >
      {imageProps && (
        <div {...(onlyImage ? styles.onlyImageContainer : styles.imageContainer)}>
          <LazyLoad visible={aboveTheFold}>
            <img src={imageProps.src} srcSet={imageProps.srcSet} alt={alt}
              {...(onlyImage ? styles.onlyImage : styles.image)} />
          </LazyLoad>
        </div>
      )}
      {!onlyImage && <div {...styles.textContainer}>
        <Text color={color} maxWidth={'600px'} margin={'0 auto'}>
          {children}
        </Text>
      </div>}
    </div>
  )
}

Tile.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  image: PropTypes.string,
  alt: PropTypes.string,
  color: PropTypes.string,
  bgColor: PropTypes.string,
  align: PropTypes.oneOf([
    'top',
    'middle',
    'bottom'
  ]),
  aboveTheFold: PropTypes.bool,
  onlyImage: PropTypes.bool
}

Tile.defaultProps = {
  alt: ''
}

export default Tile
