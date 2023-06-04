import { IconTitle } from '@republik/icons'
import { ElementConfigI } from '../../custom-types'

export const config: ElementConfigI = {
  structure: [{ type: ['text', 'memo', 'break'], repeat: true }],
  button: { icon: IconTitle },
}
