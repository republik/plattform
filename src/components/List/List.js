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

const WIDTH = 22
const MARGIN = 8

const styles = {
  list: css({
    marginLeft: 0,
    paddingLeft: 0,
    listStyle: 'none',
    'li &': {
      [mUp]: {
        marginLeft: `${WIDTH}px`
      }
    }
  }),
  unorderedBefore: css({
    '& > li:before': {
      content: '–',
      position: 'absolute',
      left: 0,
      [mUp]: {
        left: `-${WIDTH}px`
      }
    }
  }),
  orderedBefore: css({
    '& > li:before': {
      content: 'counter(start) ". "',
      counterIncrement: 'start',
      position: 'absolute',
      left: 0,
      [mUp]: {
        left: `-${WIDTH + MARGIN}px`,
        width: `${WIDTH}px`,
        textAlign: 'right'
      }
    }
  }),
  li: css({
    color: colors.text,
    paddingLeft: `${WIDTH}px`,
    position: 'relative',
    ...serifRegular16,
    [mUp]: {
      ...serifRegular19,
      paddingLeft: 0
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
    },
    'ol > &': {
      paddingLeft: `${WIDTH + MARGIN}px`,
      [mUp]: {
        paddingLeft: 0
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

export const OrderedList = ({ children, attributes, start, compact }) => {
  return (
    <ol
      start={start}
      {...attributes}
      {...css(
        compact ? styles.listCompact : styles.list,
        styles.orderedBefore,
        { counterReset: `start ${start - 1}` }
      )}
    >
      {children}
    </ol>
  )
}

OrderedList.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  start: PropTypes.number,
  compact: PropTypes.bool
}

OrderedList.defaultProps = {
  start: 1
}

export const ListItem = ({ children, attributes = {}, style={} }) => (
  <li {...styles.li} {...attributes} style={style}>
    {children}
  </li>
)

ListItem.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  style: PropTypes.object
}

export const List = ({ children, data, attributes = {} }) => data.ordered
  ? <OrderedList start={data.start} {...attributes}>{ children }</OrderedList>
  : <UnorderedList>{ children }</UnorderedList>
