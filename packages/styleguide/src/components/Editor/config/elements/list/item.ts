import { ElementConfigI } from '../../../custom-types'

export const config: ElementConfigI = {
  structure: [{ type: ['text', 'link'], repeat: true }],
  attrs: {
    blockUi: {
      style: {
        display: 'none',
      },
    },
  },
}
