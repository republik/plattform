import { ElementConfigI } from '../../../../custom-types'
import { BlockQuoteParagraph } from '../../../../../BlockQuote'

export const config: ElementConfigI = {
  Component: BlockQuoteParagraph,
  structure: [{ type: ['text', 'link'], repeat: true }],
  attrs: {
    isMain: true,
  },
}
