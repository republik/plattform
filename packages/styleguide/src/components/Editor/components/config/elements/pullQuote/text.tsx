import { ElementConfigI } from '../../../../custom-types'
import { PullQuoteText } from '../../../../../PullQuote'

export const config: ElementConfigI = {
  Component: {
    article: PullQuoteText,
  },
  attrs: {
    isMain: true,
  },
}
