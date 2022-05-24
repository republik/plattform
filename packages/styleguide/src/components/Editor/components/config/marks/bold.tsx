import React from 'react'
import { MarkConfigI } from '../../../custom-types'
import { BoldIcon } from '../../../../Icons'

export const Bold = (props) => <strong {...props} />

export const config: MarkConfigI = {
  component: 'bold',
  button: { icon: BoldIcon },
}
