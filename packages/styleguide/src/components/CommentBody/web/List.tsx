import React from 'react'

import { List, ListItem as CommentListItem } from '../../List'
import { ListItemProps } from '../interfaces'

export const ListItem = ({ children }: ListItemProps) => (
  <CommentListItem
    style={{
      fontSize: 'inherit',
      lineHeight: 'inherit',
    }}
  >
    {children}
  </CommentListItem>
)

export default List
