import {
  matchZone
} from 'mdast-react-render/lib/utils'

import {
  FIGURE_SIZES
} from '../../components/Figure'
import {
  PULLQUOTE_IMAGE_SIZE
} from '../../components/PullQuote'
import {
  INFOBOX_IMAGE_SIZES,
  INFOBOX_DEFAULT_IMAGE_SIZE
} from '../../components/InfoBox'

export const matchInfoBox = matchZone('INFOBOX')
export const matchQuote = matchZone('QUOTE')
export const matchFigure = matchZone('FIGURE')

export const getDisplayWidth = ancestors => {
  const infobox = ancestors.find(matchInfoBox)
  if (infobox) {
    return INFOBOX_IMAGE_SIZES[
      infobox.data.figureSize || INFOBOX_DEFAULT_IMAGE_SIZE
    ]
  }
  const quote = ancestors.find(matchQuote)
  if (quote) {
    return PULLQUOTE_IMAGE_SIZE
  }
  const figure = ancestors.find(matchFigure)
  if (figure) {
    if (figure.data.size) {
      return FIGURE_SIZES[figure.data.size]
    }
    // child of root === e2e, root === ancestor[-1]
    if (ancestors.indexOf(figure) === ancestors.length - 2) {
      return 1200
    }
  }
  return FIGURE_SIZES.center
}
