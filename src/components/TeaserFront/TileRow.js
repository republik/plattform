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
    }
  }),
  rowMobileReverse: css({
    margin: 0,
    display: 'flex',
    flexDirection: 'column-reverse',
    [mUp]: {
      flexDirection: 'row'
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
  columns,
  mobileReverse
}) => {
  return (
    <div
      role="group"
      {...attributes}
      {...(mobileReverse ? styles.rowMobileReverse : styles.row)}
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

export default TeaserFrontTileRow
