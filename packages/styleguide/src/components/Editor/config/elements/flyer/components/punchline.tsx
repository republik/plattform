import { IconPunchline } from '@republik/icons'
import { ElementConfigI } from '../../../../custom-types'

export const config: ElementConfigI = {
  structure: [{ type: ['text', 'memo', 'link', 'break'], repeat: true }],
  button: { icon: IconPunchline },
}
