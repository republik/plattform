import { ElementConfigI } from '../../../custom-types'

export const config: ElementConfigI = {
  component: 'pullQuoteText',
  structure: [{ type: ['text', 'break'], repeat: true }],
  attrs: {
    isMain: true,
  },
}
