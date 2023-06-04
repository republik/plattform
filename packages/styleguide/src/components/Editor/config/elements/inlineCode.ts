import { ElementConfigI } from '../../custom-types'
import { IconCode } from '@republik/icons'

export const config: ElementConfigI = {
  structure: [{ type: ['text', 'memo'], repeat: true }],
  attrs: {
    isInline: true,
    formatText: false,
  },
  button: { icon: IconCode },
}
