import { ElementConfigI } from '../../../custom-types'

export const config: ElementConfigI = {
  structure: [{ type: ['text', 'memo'], repeat: true }],
  attrs: {
    isInline: true,
    isInlineBlock: true,
  },
}
