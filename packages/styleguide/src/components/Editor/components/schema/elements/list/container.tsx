import { ElementConfigI, NodeTemplate } from '../../../../custom-types'
import { UlIcon, OlIcon } from '../../../../../Icons'
import React from 'react'
import { List } from '../../../../../List'

const ListComponent: React.FC<{
  ordered: boolean
  attributes: any
  [x: string]: unknown
}> = ({ children, ordered, attributes = {}, ...props }) => {
  const { ref, ...attrs } = attributes
  return (
    <List {...attrs} {...props} data={{ ordered }}>
      {children}
    </List>
  )
}

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
