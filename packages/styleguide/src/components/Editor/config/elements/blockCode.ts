import { ElementConfigI } from '../../custom-types'
import { BlockCodeIcon } from '../../../Icons'

export const config: ElementConfigI = {
  structure: [{ type: ['text', 'break'], repeat: true }],
  button: { icon: BlockCodeIcon },
}
