import { ElementConfigI } from '../../../../../custom-types'

export const config: ElementConfigI = {
  structure: [{ type: ['text', 'link', 'break', 'inlineCode'], repeat: true }],
  attrs: {
    formatText: true,
    blockUi: {
      style: {
        top: 4,
        left: -70,
      },
    },
  },
}
