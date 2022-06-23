import { ElementConfigI } from '../../../custom-types'
import { BlockQuoteIcon } from '../../../../Icons'

export const config: ElementConfigI = {
  component: 'blockQuote',
  structure: [
    { type: 'blockQuoteText', repeat: true },
    { type: 'figureCaption' },
  ],
  button: { icon: BlockQuoteIcon },
}
