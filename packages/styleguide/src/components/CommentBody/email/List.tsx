import React from 'react'

import { paragraphStyle } from './Paragraph'
import { ListItemProps, ListProps } from '../interfaces'

const listStyle = {
  marginLeft: '1em',
  paddingLeft: '1em',
}

export const ListItem = ({ children }: ListItemProps) => (
  <li style={paragraphStyle}>{children}</li>
)

export default function List({ children, data }: ListProps) {
  if (data.ordered) {
    return (
      <ol start={data.start} style={listStyle}>
        {children}
      </ol>
    )
  }

  return <ul style={listStyle}>{children}</ul>
}
