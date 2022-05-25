import { ElementConfigI, NodeTemplate } from '../../../custom-types'
import { UlIcon, OlIcon } from '../../../../Icons'
import React from 'react'
import { List as InnerList } from '../../../../List'

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
const props = ['ordered']

export const ulConfig: ElementConfigI = {
  button: { icon: UlIcon },
  component: 'list',
  defaultProps: {
    ordered: false,
  },
  props,
  structure,
}

export const olConfig: ElementConfigI = {
  button: { icon: OlIcon },
  component: 'list',
  defaultProps: {
    ordered: true,
  },
  props,
  structure,
}
