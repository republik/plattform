import { ElementConfigI } from '../../../../custom-types'
import { PunchlineIcon } from '../../../../../Icons'

export const config: ElementConfigI = {
  component: 'flyerPunchline',
  structure: [{ type: ['text', 'link', 'break'], repeat: true }],
  button: { icon: PunchlineIcon },
}
