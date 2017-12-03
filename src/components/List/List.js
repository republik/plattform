import React from 'react'
import PropTypes from 'prop-types'
import {
  serifRegular14,
  serifRegular16,
  serifRegular17,
  serifRegular19
} from '../Typography/styles'
import colors from '../../theme/colors'
import { css, merge } from 'glamor'
import { mUp } from '../../theme/mediaQueries'

const SPACING = 22

const styles = {
  list: css({
    marginLeft: 0,
    paddingLeft: 0,
    listStyle: 'none',
    counterReset: 'item',
    'li &': {
      [mUp]: {
        marginLeft: `${SPACING}px`
      }
    }
  }),
  unorderedBefore: css({
    '& > li:before': {
      content: '–',
      position: 'absolute',
      left: 0,
      [mUp]: {
        left: `-${SPACING}px`
      }
    }
  }),
  orderedBefore: css({
    '& > li:before': {
      content: 'counter(item) ". "',
      counterIncrement: 'item',
      position: 'absolute',
      left: 0,
      [mUp]: {
        left: `-${SPACING}px`
      }
    }
  }),
  li: css({
    color: colors.text,
    paddingLeft: `${SPACING}px`,
    position: 'relative',
    ...serifRegular16,
    [mUp]: {
      ...serifRegular19,
      paddingLeft: 0,
      lineHeight: '30px'
    },
    '& p:last-child': {
      marginBottom: 0
    },
    'li &': {
      ...serifRegular14,
      lineHeight: '22px',
      margin: '12px 0',
      [mUp]: {
        ...serifRegular17,
        margin: '14px 0'
      }
    }
  })
}

styles.listCompact = merge(styles.list, {
  '& li, & li p': {
    margin: 0
  }
})

export const UnorderedList = ({ children, attributes, compact }) => {
  return (
    <ul
      {...attributes}
      {...css(
        compact ? styles.listCompact : styles.list,
        styles.unorderedBefore
      )}
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
      {...css(compact ? styles.listCompact : styles.list, styles.orderedBefore)}
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

export const ListItem = ({ children, attributes = {} }) => (
  <li {...styles.li} {...attributes}>
    {children}
  </li>
)

ListItem.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object
}
