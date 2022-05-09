import {
  ElementConfigI,
  ElementFormProps,
  ListElement,
  NodeTemplate,
} from '../../../custom-types'
import { UlIcon, OlIcon } from '../../../../Icons'
import React from 'react'
import { List } from '../../../../List'
import Checkbox from '../../../../Form/Checkbox'

const ListComponent: React.FC<{
  element: ListElement
  [x: string]: unknown
}> = ({ children, element, ...props }) => (
  <List {...props} data={element}>
    {children}
  </List>
)

const structure: NodeTemplate[] = [{ type: 'listItem', repeat: true }]

export const ulConfig: ElementConfigI = {
  Component: ListComponent,
  structure,
  button: { icon: UlIcon },
  defaultProps: {
    ordered: false,
  },
}

export const olConfig: ElementConfigI = {
  Component: ListComponent,
  structure,
  button: { icon: OlIcon },
  defaultProps: {
    ordered: true,
  },
}
