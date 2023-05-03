import { IconBlockquote } from '@republik/icons'
import { ElementConfigI } from '../../../custom-types'

export const config: ElementConfigI = {
  structure: [
    { type: 'blockQuoteText', repeat: true, main: true },
    { type: 'figureCaption' },
  ],
  button: { icon: IconBlockquote },
}
