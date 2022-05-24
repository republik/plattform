import { ElementConfigI } from '../../../../custom-types'
import { FigureByline } from '../../../../../Figure'

export const config: ElementConfigI = {
  Component: {
    article: FigureByline,
  },
  attrs: {
    formatText: true,
    isInline: true,
  },
}
