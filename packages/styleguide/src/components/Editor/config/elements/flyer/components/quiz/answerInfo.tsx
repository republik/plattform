import { ElementConfigI } from '../../../../../custom-types'

export const config: ElementConfigI = {
  structure: [{ type: ['paragraph'], repeat: true }],
  attrs: {
    blockUi: {
      style: {
        display: 'none',
      },
    },
  },
}
