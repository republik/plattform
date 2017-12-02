import React from 'react'
import PropTypes from 'prop-types'
import { serifRegular16, serifRegular19 } from '../Typography/styles'
import colors from '../../theme/colors'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'

const SPACING = 22

const unorderedBefore = {
  '& > li:before': {
    content: '–',
    position: 'absolute',
    left: 0,
    [mUp]: {
      left: `-${SPACING}px`
    }
  }
}

const orderedBefore = {
  '& > li:before': {
    content: 'counter(item) ". "',
    counterIncrement: 'item',
    position: 'absolute',
    left: 0,
    [mUp]: {
      left: `-${SPACING}px`
    }
  }
}

const styles = {
  list: css({
    marginLeft: 0,
    paddingLeft: 0,
    listStyle: 'none',
    counterReset: 'item',
    '& li': {
      color: colors.text,
      margin: '24px 0',
      paddingLeft: `${SPACING}px`,
      position: 'relative',
      ...serifRegular16,
      [mUp]: {
        ...serifRegular19,
        paddingLeft: 0,
        margin: '30px 0',
        lineHeight: '30px'
      }
    },
    '& li li': {
      fontSize: '14px',
      margin: '12px 0',
      [mUp]: {
        fontSize: '17px',
        margin: '14px 0'
      }
    },
    'li &': {
      [mUp]: {
        marginLeft: `${SPACING}px`
      }
    }
  }),
  compact: {
    '& li': {
      margin: '0 !important',
      [mUp]: {
        margin: '0 !important'
      }
    }
  }
}

export const UnorderedList = ({ children, attributes, compact }) => {
  return (
    <ul
      {...attributes}
      {...css(styles.list, unorderedBefore, compact ? styles.compact : {})}
    >
      {children}
    </ul>
  )
}

UnorderedList.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  compact: PropTypes.bool
}

export const OrderedList = ({ children, attributes, compact }) => {
  return (
    <ol
      {...attributes}
      {...css(styles.list, orderedBefore, compact ? styles.compact : {})}
    >
      {children}
    </ol>
  )
}

OrderedList.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  compact: PropTypes.bool
}
