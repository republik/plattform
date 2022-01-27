import React from 'react'
import { css } from 'glamor'

import { colors, fontFamilies } from '@project-r/styleguide'

const styles = {
  list: css({
    fontFamily: fontFamilies.sansSerifRegular,
    fontSize: 17,
    lineHeight: '25px',
    listStyle: 'none',
    margin: '10px 0',
    padding: 0
  }),
  item: css({
    borderTop: `1px solid ${colors.divider}`,
    padding: '5px 0',
    ':last-child': {
      borderBottom: `1px solid ${colors.divider}`
    }
  }),
  highlight: css({
    fontFamily: fontFamilies.sansSerifMedium,
    fontWeight: 'normla'
  })
}

export const Item = ({ children }) => <li {...styles.item}>{children}</li>

const List = ({ children, ...props }) => (
  <ul {...props} {...styles.list}>
    {children}
  </ul>
)

List.Item = Item

export const Highlight = ({ children }) => (
  <span {...styles.highlight}>{children}</span>
)

export default List
