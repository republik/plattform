import { ElementConfigI } from '../../../../custom-types'
import { PullQuote } from '../../../../../PullQuote'
import { QuoteIcon } from '../../../../../Icons'

export const config: ElementConfigI = {
  Component: PullQuote,
  structure: [{ type: 'pullQuoteText' }, { type: 'pullQuoteSource' }],
  button: { icon: QuoteIcon },
}
