import React from 'react'
import PropTypes from 'prop-types'
import {
  serifRegular14,
  serifRegular17,
  serifRegular19,
} from '../Typography/styles'
import { css, merge } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { convertStyleToRem, pxToRem } from '../Typography/utils'
import { editorialFontRule } from '../Typography/fontRules'
import { useColorContext } from '../Colors/useColorContext'

export const LIST_PADDING = 22
const MARGIN = 8

const styles = {
  unorderedList: css({
    marginLeft: 0,
    paddingLeft: 0,
    listStyle: 'none',
    '& > li:before': {
      content: '–',
      position: 'absolute',
      left: 0,
    },
  }),
  orderedList: css({
    paddingLeft: '1.7em',
    '& > li': {
      paddingLeft: `${MARGIN}px`,
    },
  }),
  li: css({
    paddingLeft: `${LIST_PADDING}px`,
    position: 'relative',
    ...convertStyleToRem(serifRegular17),
    [mUp]: {
      ...convertStyleToRem(serifRegular19),
    },
    '& p': {
      margin: '1em 0 1em 0',
    },
    '& p:last-child': {
      marginBottom: 0,
    },
    'li &': {
      ...convertStyleToRem(serifRegular14),
      lineHeight: pxToRem('22px'),
      margin: '12px 0',
      [mUp]: {
        ...convertStyleToRem(serifRegular17),
        lineHeight: pxToRem('28px'),
        margin: '14px 0',
      },
    },
  }),
}

styles.unorderedListCompact = merge(styles.unorderedList, {
  '& li, & li p': {
    margin: 0,
  },
})

styles.orderedListCompact = merge(styles.orderedList, {
  '& li, & li p': {
    margin: 0,
  },
})

export const UnorderedList = ({ children, attributes, compact }) => {
  return (
    <ul
      {...attributes}
      {...(compact ? styles.unorderedListCompact : styles.unorderedList)}
    >
      {children}
    </ul>
  )
}

UnorderedList.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  compact: PropTypes.bool,
}

export const OrderedList = ({ children, attributes, start, compact }) => {
  return (
    <ol
      start={start}
      {...attributes}
      {...(compact ? styles.orderedListCompact : styles.orderedList)}
    >
      {children}
    </ol>
  )
}

OrderedList.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  start: PropTypes.number,
  compact: PropTypes.bool,
}

OrderedList.defaultProps = {
  start: 1,
}

export const ListItem = ({ children, attributes = {}, style = {} }) => {
  const [colorScheme] = useColorContext()
  return (
    <li
      {...styles.li}
      {...editorialFontRule}
      {...colorScheme.set('color', 'text')}
      {...attributes}
      style={style}
    >
      {children}
    </li>
  )
}

ListItem.propTypes = {
  children: PropTypes.any,
  attributes: PropTypes.object,
  style: PropTypes.object,
}

export const List = ({ children, data, attributes = {} }) =>
  data.ordered ? (
    <OrderedList
      start={data.start}
      compact={data.compact}
      attributes={attributes}
    >
      {children}
    </OrderedList>
  ) : (
    <UnorderedList compact={data.compact} attributes={attributes}>
      {children}
    </UnorderedList>
  )
