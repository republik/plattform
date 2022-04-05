import {
  ElementConfigI,
  ElementFormProps,
  ListElement,
} from '../../../custom-types'
import { ListIcon } from '../../../../Icons'
import React from 'react'
import { List } from '../../../../List'
import Checkbox from '../../../../Form/Checkbox'

const Component: React.FC<{
  element: ListElement
  [x: string]: unknown
}> = ({ children, element, ...props }) => (
  <List {...props} data={element}>
    {children}
  </List>
)

const Form: React.FC<ElementFormProps<ListElement>> = ({
  element,
  onChange,
}) => (
  <div>
    <Checkbox
      checked={element.ordered}
      onChange={(_, checked) => onChange({ ordered: checked })}
    >
      Ordered List
    </Checkbox>
  </div>
)

export const config: ElementConfigI = {
  Component,
  Form,
  structure: [{ type: 'listItem', repeat: true }],
  button: { icon: ListIcon },
}
