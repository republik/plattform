import React from 'react'

import { List, ListItem as CommentListItem} from '../../List'

export const ListItem = ({ children }) => (
  <CommentListItem style={{
    fontSize: 'inherit',
    lineHeight: 'inherit'
  }}>
    {children}
  </CommentListItem>
)

export default List
