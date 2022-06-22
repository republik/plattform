import React from 'react'
import { MarkConfigI } from '../../custom-types'
import { BoldIcon } from '../../../Icons'

export const Bold = ({ children, attributes }) => (
  <strong {...attributes}>{children}</strong>
)

export const config: MarkConfigI = {
  component: 'bold',
  button: { icon: BoldIcon },
}
