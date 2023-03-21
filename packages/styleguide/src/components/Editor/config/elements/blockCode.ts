import { ElementConfigI } from '../../custom-types'
import { BlockCodeIcon } from '../../../Icons'

export const config: ElementConfigI = {
  structure: [{ type: ['text', 'memo', 'break'], repeat: true }],
  button: { icon: BlockCodeIcon },
}
