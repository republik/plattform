import { ElementConfigI } from '../../../custom-types'
import { QuoteIcon } from '../../../../Icons'

export const config: ElementConfigI = {
  structure: [
    { type: 'pullQuoteText', main: true },
    { type: 'pullQuoteSource' },
  ],
  button: { icon: QuoteIcon },
}
