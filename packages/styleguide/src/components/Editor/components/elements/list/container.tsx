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

const structure: NodeTemplate[] = [{ type: 'listItem', repeat: true }]

export const ulConfig: ElementConfigI = {
  Component: ListComponent,
  Form,
  structure,
  button: { icon: UlIcon },
  defaultProps: {
    ordered: false,
  },
}

export const olConfig: ElementConfigI = {
  Component: ListComponent,
  Form,
  structure,
  button: { icon: OlIcon },
  defaultProps: {
    ordered: true,
  },
}
