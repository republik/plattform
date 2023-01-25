import { ElementConfigI } from '../../../../custom-types'
import { PunchlineIcon } from '../../../../../Icons'

export const config: ElementConfigI = {
  structure: [{ type: ['text', 'memo', 'link', 'break'], repeat: true }],
  button: { icon: PunchlineIcon },
}
