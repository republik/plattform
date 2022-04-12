import { ElementConfigI, ListItemElement } from '../../../custom-types'
import React from 'react'
import { ListItem } from '../../../../List'

const Component: React.FC<{
  element: ListItemElement
  [x: string]: unknown
}> = ({ children, element, ...props }) => (
  <ListItem {...{ ...props, element }}>{children}</ListItem>
)

export const config: ElementConfigI = {
  Component,
  structure: [{ type: ['text', 'link'], repeat: true }],
  attrs: {
    formatText: true,
  },
}
