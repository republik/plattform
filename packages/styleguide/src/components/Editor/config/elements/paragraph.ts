import { ElementConfigI } from '../../custom-types'
import { ParagraphIcon } from '../../../Icons'

export const config: ElementConfigI = {
  structure: [{ type: ['text', 'link', 'break', 'inlineCode'], repeat: true }],
  attrs: {
    formatText: true,
    blockUi: {
      style: {
        top: 4,
      },
    },
    stopFormIteration: true,
  },
  button: { icon: ParagraphIcon },
}
