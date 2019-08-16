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
    flexDirection: 'column',
    [mUp]: {
      flexDirection: 'row',
      justifyContent: 'center'
    },
    '& .tile': {
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
    }
  }),

  // One column
  mobileCol1: css({
    '& .tile': {
      width: '100%'
    }
  }),
  col1: css({}),

  // Two Columns
  mobileCol2: css({
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    '& .tile': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '50%'
    },
    '& .tile:nth-child(3)': {
      width: '100%'
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
      flexWrap: 'nowrap',
      '& .tile': {
        width: '33%',
        borderLeft: `1px solid ${colors.divider}`,
        borderTop: 'none',
        margin: 0,
        padding: '60px 0'
      },
      '& .tile:nth-child(2n+1)': {
        borderLeft: 'none'
      },
      '& .tile:nth-child(3)': {
        width: '33%'
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
  mobileColumns = 1
}) => {
  const rowStyles = css(
    styles.row,
    styles[`col${columns}`],
    styles[`mobileCol${mobileColumns}`]
  )
  return (
    <div role="group" {...attributes} {...rowStyles}>
      {children}
    </div>
  )
}

TeaserFrontTileRow.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  columns: PropTypes.oneOf([1, 2, 3]).isRequired,
  mobileColumns: PropTypes.oneOf([1, 2, 3]).isRequired,
  mobileReverse: PropTypes.bool
}

TeaserFrontTileRow.defaultProps = {
  columns: 1,
  mobileColumns: 1
}

export default TeaserFrontTileRow
