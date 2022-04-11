import { ElementConfigI } from '../../custom-types'
import { Interaction } from '../../../Typography'

export const config: ElementConfigI = {
  Component: Interaction.H2,
  structure: [{ type: ['text', 'link'], repeat: true }],
}
