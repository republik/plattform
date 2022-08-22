import { ElementConfigI } from '../../../custom-types'
import { BlockQuoteIcon } from '../../../../Icons'

export const config: ElementConfigI = {
  structure: [
    { type: 'blockQuoteText', repeat: true, main: true },
    { type: 'figureCaption' },
  ],
  button: { icon: BlockQuoteIcon },
}
