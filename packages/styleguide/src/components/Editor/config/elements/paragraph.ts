import { ElementConfigI } from '../../custom-types'
import { ParagraphIcon } from '../../../Icons'

export const config: ElementConfigI = {
  structure: [{ type: ['text', 'link', 'break', 'inlineCode'], repeat: true }],
  attrs: {
    formatText: true,
  },
  button: { icon: ParagraphIcon },
}
