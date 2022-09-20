import { ElementConfigI } from '../../custom-types'
import { CodeIcon } from '../../../Icons'

export const config: ElementConfigI = {
  structure: [{ type: ['text'], repeat: true }],
  attrs: {
    isInline: true,
    isTextInline: true,
  },
  button: { icon: CodeIcon },
}
