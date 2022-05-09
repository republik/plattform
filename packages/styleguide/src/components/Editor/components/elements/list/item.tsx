import { ElementConfigI, ListItemElement } from '../../../custom-types'
import React from 'react'
import { ListItem } from '../../../../List'

const ListItemComponent: React.FC<{
  element: ListItemElement
  [x: string]: unknown
}> = ({ children, element, ...props }) => (
  <ListItem {...{ ...props, element }}>{children}</ListItem>
)

export const config: ElementConfigI = {
  Component: ListItemComponent,
  structure: [{ type: ['text', 'link'], repeat: true }],
  attrs: {
    formatText: true,
    isMain: true,
  },
}
