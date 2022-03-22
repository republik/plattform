import { ElementConfigI, ListElement } from '../../../custom-types'
import { ListIcon } from '../../../../Icons'
import React from 'react'
import { List } from '../../../../List'

const Component: React.FC<{
  element: ListElement
  [x: string]: unknown
}> = ({ children, element, ...props }) => (
  <List {...props} data={element}>
    {children}
  </List>
)

export const config: ElementConfigI = {
  Component,
  structure: [{ type: 'listItem', repeat: true }],
  button: { icon: ListIcon },
}
