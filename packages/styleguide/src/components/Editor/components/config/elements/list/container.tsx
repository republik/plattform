import { ElementConfigI, NodeTemplate } from '../../../../custom-types'
import { UlIcon, OlIcon } from '../../../../../Icons'
import React from 'react'
import { List as InnerList } from '../../../../../List'

export const List: React.FC<{
  ordered: boolean
  attributes: any
  [x: string]: unknown
}> = ({ children, ordered, attributes = {}, ...props }) => {
  const { ref, ...attrs } = attributes
  return (
    <InnerList {...attrs} {...props} data={{ ordered }}>
      {children}
    </InnerList>
  )
}

const structure: NodeTemplate[] = [{ type: 'listItem', repeat: true }]

export const ulConfig: ElementConfigI = {
  component: 'list',
  structure,
  button: { icon: UlIcon },
  defaultProps: {
    ordered: false,
  },
}

export const olConfig: ElementConfigI = {
  component: 'list',
  structure,
  button: { icon: OlIcon },
  defaultProps: {
    ordered: true,
  },
}
