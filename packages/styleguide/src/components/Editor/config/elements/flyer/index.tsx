import { ElementConfigI } from '../../../custom-types'
import { getId } from '../../../Core/helpers/utils'
import { IconFlyerTile } from '@republik/icons'

export const baseConfig: Partial<ElementConfigI> = {
  attrs: {
    blockUi: {
      style: {
        top: 10,
      },
    },
    stopFormIteration: true,
  },
  props: ['id'],
  defaultProps: {
    id: getId,
  },
}

export const config: ElementConfigI = {
  ...baseConfig,
  structure: [
    { type: 'flyerMetaP', main: true },
    { type: 'flyerTopic' },
    { type: 'flyerTitle' },
    { type: 'flyerAuthor' },
    { type: ['paragraph', 'ul', 'ol', 'quiz'], repeat: true },
    {
      type: ['flyerPunchline', 'pullQuote', 'articlePreview', 'figure'],
    },
  ],
  button: { icon: IconFlyerTile },
}
