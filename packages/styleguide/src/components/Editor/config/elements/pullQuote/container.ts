import { IconFormatQuote } from '@republik/icons'
import { ElementConfigI } from '../../../custom-types'

export const config: ElementConfigI = {
  structure: [
    { type: 'pullQuoteText', main: true },
    { type: 'pullQuoteSource' },
  ],
  button: { icon: IconFormatQuote },
}
