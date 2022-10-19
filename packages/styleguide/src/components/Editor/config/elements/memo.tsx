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
    // inheritable?
    formatText: true,
    stopFormIteration: true,
  },
  button: { icon: MemoIcon },
  structure: [{ type: ['text'], repeat: true }],
  props: ['parentId', 'marker'],
}
