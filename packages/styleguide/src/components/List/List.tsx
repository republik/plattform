import React from 'react'
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
import { ChildrenProps } from '../../types/base'

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

const unorderedListCompactStyle = merge(styles.unorderedList, {
  '& li, & li p': {
    margin: 0,
  },
})

const orderedListCompactStyle = merge(styles.orderedList, {
  '& li, & li p': {
    margin: 0,
  },
})

interface UnorderedListProps extends ChildrenProps {
  attributes?: React.ComponentPropsWithoutRef<'ul'>
  compact?: boolean
}

export const UnorderedList = ({
  children,
  attributes,
  compact,
}: UnorderedListProps) => {
  return (
    <ul
      {...attributes}
      {...(compact ? unorderedListCompactStyle : styles.unorderedList)}
    >
      {children}
    </ul>
  )
}

interface OrderedListProps extends ChildrenProps {
  attributes?: React.ComponentPropsWithoutRef<'ol'>
  start?: number
  compact?: boolean
}

export const OrderedList = ({
  children,
  attributes,
  start = 1,
  compact,
}: OrderedListProps) => {
  return (
    <ol
      start={start}
      {...attributes}
      {...(compact ? orderedListCompactStyle : styles.orderedList)}
    >
      {children}
    </ol>
  )
}

export interface ListItemProps extends ChildrenProps {
  children: React.ReactNode
  attributes?: React.ComponentPropsWithoutRef<'li'>
  style?: React.CSSProperties
}

export const ListItem = ({
  children,
  attributes = {},
  style = {},
}: ListItemProps) => {
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

export interface ListProps extends ChildrenProps {
  data: {
    compact?: boolean
  } & ({ ordered: true; start?: number } | { ordered?: false })
  attributes?: React.ComponentPropsWithoutRef<'ul' | 'ol'>
}

export const List = ({ children, data, attributes = {} }: ListProps) => {
  if (data.ordered) {
    return (
      <OrderedList
        attributes={attributes}
        start={data.start}
        compact={data.compact}
      >
        {children}
      </OrderedList>
    )
  }
  return (
    <UnorderedList attributes={attributes} compact={data.compact}>
      {children}
    </UnorderedList>
  )
}
