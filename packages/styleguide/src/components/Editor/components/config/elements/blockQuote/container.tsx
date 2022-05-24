import { ElementConfigI } from '../../../../custom-types'
import { BlockQuote } from '../../../../../BlockQuote'
import { BlockQuoteIcon } from '../../../../../Icons'

export const config: ElementConfigI = {
  Component: {
    article: BlockQuote,
  },
  structure: [
    { type: 'blockQuoteText', repeat: true },
    { type: 'figureCaption' },
  ],
  button: { icon: BlockQuoteIcon },
}
