import { css } from 'glamor'
import PropTypes from 'prop-types'
import React from 'react'
import colors from '../../theme/colors'
import { breakoutUp } from '../Center'
import { mUp } from './mediaQueries'
import { sizeSmall, sizeMedium } from './Tile'

const styles = {
  row: css({
    margin: 0,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    // [mUp]: {
    //   flexDirection: 'row',
    //   justifyContent: 'center'
    // }
    '& .tile': {
      margin: '0 auto',
      textAlign: 'center',
      padding: '30px 15px 40px 15px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      [mUp]: {
        padding: '60px 0'
      }
    }
  }),

  rowMobileReverse: css({
    margin: 0,
    display: 'flex',
    flexDirection: 'column-reverse',
    [mUp]: {
      flexDirection: 'row'
    },

    '& .tile': {
      margin: '0 auto',
      textAlign: 'center',
      padding: '30px 15px 40px 15px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      [mUp]: {
        padding: '60px 0'
      }
    }
  }),

  col2: css({
    '& .tile': {
      width: '50%',
      padding: '15px'
    },

    [mUp]: {
      '& .tile': {
        width: '50%',
        flex: '1 1 0'
      },

      '& img': {
        ...sizeSmall
      }
    },
    [breakoutUp]: {
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
      flexWrap: 'wrap',
      '& .tile': {
        width: '33%',
        borderLeft: `1px solid ${colors.divider}`,
        borderTop: 'none',
        margin: '0 0 50px 0',
        padding: '20px 0'
      },
      '& .tile:nth-child(2n+1)': {
        borderLeft: 'none'
      },
      '& img': {
        ...sizeSmall
      }
    },
    [breakoutUp]: {
      '& .tile': {
        width: '33%'
      },
      '& .tile:nth-child(2n+1)': {
        borderLeft: `1px solid ${colors.divider}`
      },
      '& .tile:nth-child(3n+1)': {
        borderLeft: 'none'
      },
      '& img': {
        ...sizeSmall
      }
    }
  })
}

export const TeaserFrontTileRow = ({
  children,
  attributes,
  columns = 1,
  mobileReverse
}) => {
  const rowStyles = css(
    mobileReverse ? styles.rowMobileReverse : styles.row,
    styles[`col${columns}`]
  )
  // FIXME: still stack tiles when there are three columns!
  return (
    <div role="group" {...attributes} {...rowStyles}>
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

export default TeaserFrontTileRow
