import React from 'react'
import { MarkConfigI } from '../../custom-types'
import { ItalicIcon } from '../../../Icons'

export const Italic = (props) => <em {...props} />

export const config: MarkConfigI = {
  component: 'italic',
  button: { icon: ItalicIcon },
}
