import React, { ComponentPropsWithoutRef } from 'react'
import CommentList, { ListItem as CommentListItem } from '../web/List'

import { paragraphStyle } from './Paragraph'

const listStyle = {
  marginLeft: '1em',
  paddingLeft: '1em',
}

export const ListItem = ({
  children,
}: ComponentPropsWithoutRef<typeof CommentListItem>) => (
  <li style={paragraphStyle}>{children}</li>
)

const List = ({
  children,
  data,
}: ComponentPropsWithoutRef<typeof CommentList>) =>
  data.ordered ? (
    <ol start={data.start} style={listStyle}>
      {children}
    </ol>
  ) : (
    <ul style={listStyle}>{children}</ul>
  )

export default List
