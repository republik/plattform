import { ElementConfigI } from '../../../../custom-types'
import { BlockQuoteParagraph } from '../../../../../BlockQuote'

export const config: ElementConfigI = {
  Component: {
    article: BlockQuoteParagraph,
  },
  attrs: {
    isMain: true,
  },
}
