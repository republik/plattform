import React from 'react'
import { MarkConfigI } from '../../custom-types'
import { ItalicIcon } from '../../../Icons'

export const Italic = ({ children, attributes }) => (
  <em {...attributes}>{children}</em>
)

export const config: MarkConfigI = {
  component: 'italic',
  button: { icon: ItalicIcon },
}
