import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { mUp, tUp } from '../TeaserFront/mediaQueries'
import Text from '../TeaserFront/Text'

const IMAGE_SIZE = {
  small: 180,
  medium: 260
}

const sizeSmall = {
  maxHeight: `${IMAGE_SIZE.small}px`,
  maxWidth: `${IMAGE_SIZE.small}px`
}

const sizeMedium = {
  maxHeight: `${IMAGE_SIZE.medium}px`,
  maxWidth: `${IMAGE_SIZE.medium}px`
}

const styles = {
  tile: css({
    margin: '0',
    textAlign: 'center',
    padding: '30px 15px',
    width: '100%',
    [mUp]: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '50px',
      padding: '20px 0'
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
      margin: '0 auto 40px auto'
    }
  }),
  image: css({
    minWidth: '100px',
    ...sizeMedium
  }),
  row: css({
    margin: 0,
    display: 'block',
    '& .tile': {
      borderTop: `1px solid ${colors.divider}`
    },
    [mUp]: {
      display: 'flex',
      flexFlow: 'row wrap',
      '& .tile': {
        width: '33.3%',
        borderTop: 'none',
        borderLeft: `1px solid ${colors.divider}`
      },
      '& .tile:nth-child(3n+1)': {
        borderLeft: 'none'
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

export const DossierTileRow = ({ children, attributes }) => {
  return (
    <div
      role="group"
      {...attributes}
      {...styles.row}
    >
      {children}
    </div>
  )
}

DossierTileRow.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object
}

const Tile = ({ children, attributes, image, alt, onClick}) => {
  return (
    <div
      {...attributes}
      {...styles.tile}
      onClick={onClick}
      style={{
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
        <Text maxWidth={'600px'} margin={'0 auto'}>
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
  alt: PropTypes.string
}

Tile.defaultProps = {
  alt: ''
}

export default Tile
