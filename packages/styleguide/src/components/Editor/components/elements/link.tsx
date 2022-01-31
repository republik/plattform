import {
  ElementConfigI,
  ElementFormProps,
  LinkElement
} from '../../custom-types'
import { LinkIcon } from '../../../Icons'
import { Editorial } from '../../../Typography'
import React from 'react'
import Field from '../../../Form/Field'

const Form: React.FC<ElementFormProps<LinkElement>> = ({
  element,
  onChange
}) => (
  <Field
    label='URL'
    value={element.href}
    onChange={(_, href: string) => onChange({ href })}
  />
)

export const config: ElementConfigI = {
  Component: Editorial.A,
  Form,
  attrs: {
    isInline: true,
    formatText: true
  },
  button: { icon: LinkIcon }
}
