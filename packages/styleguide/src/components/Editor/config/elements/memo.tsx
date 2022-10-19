import {
  ElementConfigI,
  ElementFormProps,
  LinkElement,
} from '../../custom-types'
import { MemoIcon } from '../../../Icons'
import React from 'react'

const Form: React.FC<ElementFormProps<LinkElement>> = ({
  element,
  onChange,
}) => {
  return <span>Form</span>
}

export const config: ElementConfigI = {
  Form,
  attrs: {
    isInline: true,
    stopFormIteration: true,
  },
  button: { icon: MemoIcon, small: true },
  structure: [{ type: 'inherit' }],
  props: ['parentId', 'marker'],
}
