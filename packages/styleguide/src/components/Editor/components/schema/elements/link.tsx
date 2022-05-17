import {
  ElementConfigI,
  ElementFormProps,
  LinkElement,
  NormalizeFn,
} from '../../../custom-types'
import { LinkIcon } from '../../../../Icons'
import { Editorial } from '../../../../Typography'
import React from 'react'
import Field from '../../../../Form/Field'
import { Editor, Transforms } from 'slate'

const Form: React.FC<ElementFormProps<LinkElement>> = ({
  element,
  onChange,
}) => (
  <Field
    label='URL'
    value={element.href}
    onChange={(_, href: string) => onChange({ href })}
  />
)

const unlinkWhenEmpty: NormalizeFn<LinkElement> = ([node, path], editor) => {
  if (Editor.string(editor, path) === '') {
    Transforms.unwrapNodes(editor, { at: path })
    return true
  }
  return false
}

export const config: ElementConfigI = {
  Component: Editorial.A,
  normalizations: [unlinkWhenEmpty],
  defaultProps: {
    href: 'https://',
  },
  Form,
  attrs: {
    isInline: true,
    formatText: true,
  },
  button: { icon: LinkIcon },
}
