import { css, merge } from 'glamor'
import PropTypes from 'prop-types'
import React from 'react'
import colors from '../../theme/colors'
import { breakoutUp } from '../Center'
import { mUp } from './mediaQueries'
import { sizeSmall, sizeMedium } from './Tile'

const styles = {
  base: css({
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
  mobileReverse: css({
    flexDirection: 'column-reverse'
  }),

  // One column
  mobileCol1: css({
    '& .tile': {
      width: '100%'
    }
  }),

  // Two Columns
  mobileCol2: css({
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    [mUp]: {
      flexWrap: 'nowrap'
    },
    '& .tile': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '50%',
      [mUp]: {
        width: '100%',
      }
    },
    '& .tile:nth-child(3)': {
      width: '100%'
    }
  }),
  col1: css({}),
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
    [mUp]: {
      flexWrap: 'nowrap',
      '& .tile': {
        width: '33%',
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
      '& img': {
        ...sizeSmall
      }
    }
  }),
  autoColumns: css({
    '& .tile': {
      borderTop: `1px solid ${colors.divider}`
    },
    [mUp]: {
      flexWrap: 'wrap',
      '& .tile': {
        width: '50%',
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
        width: '33%',
      },
      '& .tile:nth-child(2n+1)': {
        borderLeft: `1px solid ${colors.divider}`,
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
  columns,
  autoColumns,
  mobileReverse,
  mobileColumns
}) => {
  const rowStyles = merge(
    styles.base,
    !autoColumns && styles[`col${columns}`],
    mobileReverse && styles.mobileReverse,
    autoColumns ? styles.autoColumns : styles[`mobileCol${mobileColumns}`]
  )
  return (
    <div role='group' {...attributes} {...rowStyles}>
      {children}
    </div>
  )
}

TeaserFrontTileRow.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  mobileReverse: PropTypes.bool,
  autoColumns: PropTypes.bool,
  columns: PropTypes.oneOf([1, 2, 3]).isRequired,
  mobileColumns: PropTypes.oneOf([1, 2]).isRequired
}

TeaserFrontTileRow.defaultProps = {
  columns: 1,
  mobileColumns: 1
}

export default TeaserFrontTileRow
