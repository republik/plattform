import { ElementConfigI } from '../../../../custom-types'
import { FigureCaption } from '../../../../../Figure'

export const config: ElementConfigI = {
  Component: {
    article: FigureCaption,
  },
  structure: [
    { type: ['text', 'link'], repeat: true },
    { type: 'figureByline' },
    // TODO: end node could/should be added automatically
    // TODO: repeat ends nodes to prevent text deletion
    { type: 'text', end: true },
  ],
}
