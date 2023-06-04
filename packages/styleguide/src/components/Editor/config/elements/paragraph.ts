import { IconParagraph } from '@republik/icons'
import { ElementConfigI } from '../../custom-types'

export const config: ElementConfigI = {
  structure: [
    { type: ['text', 'memo', 'link', 'break', 'inlineCode'], repeat: true },
  ],
  attrs: {
    formatText: true,
    blockUi: {
      style: {
        top: 4,
      },
    },
  },
  button: { icon: IconParagraph },
}
