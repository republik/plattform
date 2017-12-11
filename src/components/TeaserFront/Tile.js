import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { mUp, tUp } from './mediaQueries'
import Text from './Text'

const IMAGE_SIZE = {
  small: 220,
  medium: 300,
  large: 360
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
      padding: '8% 0'
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
  })
}

export const TeaserFrontTileRow = ({ children, attributes, columns }) => {
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
  columns: PropTypes.oneOf([1, 2]).isRequired
}

TeaserFrontTileRow.defaultProps = {
  columns: 1
}

const Tile = ({ children, attributes, image, alt, onClick, color, bgColor }) => {
  const background = bgColor || ''
  return (
    <div
      {...attributes}
      {...styles.container}
      onClick={onClick}
      style={{
        background,
        cursor: onClick ? 'pointer' : 'default'
      }}
      className='tile'
    >
      {image && (
        <div {...styles.imageContainer}>
          <img src={image} alt={alt} {...styles.image} />
        </div>
      )}
      <div {...styles.textContainer}>
        <Text color={color} maxWidth={'600px'} margin={'0 auto'}>
          {children}
        </Text>
      </div>
    </div>
  )
}

Tile.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  image: PropTypes.string,
  alt: PropTypes.string,
  color: PropTypes.string,
  bgColor: PropTypes.string
}

Tile.defaultProps = {
  alt: ''
}

export default Tile
