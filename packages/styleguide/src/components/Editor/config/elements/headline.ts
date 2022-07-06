import { ElementConfigI } from '../../custom-types'
import { TitleIcon } from '../../../Icons'

export const config: ElementConfigI = {
  component: 'headline',
  structure: [{ type: ['text', 'break'], repeat: true }],
  button: { icon: TitleIcon },
}
