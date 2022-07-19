import { ElementConfigI } from '../../../custom-types'

export const config: ElementConfigI = {
  component: 'listItem',
  structure: [{ type: ['text', 'link'], repeat: true }],
  attrs: {
    formatText: true,
  },
}
