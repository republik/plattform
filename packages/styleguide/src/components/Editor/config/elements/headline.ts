import { ElementConfigI } from '../../custom-types'
import { TitleIcon } from '../../../Icons'

export const config: ElementConfigI = {
  structure: [{ type: ['text', 'memo', 'break'], repeat: true }],
  button: { icon: TitleIcon },
}
