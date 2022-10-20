import { ElementConfigI } from '../../../custom-types'

export const config: ElementConfigI = {
  structure: [{ type: ['text', 'link'], repeat: true }],
  attrs: {
    formatText: true,
    blockUi: {
      style: {
        display: 'none',
      },
    },
  },
}
