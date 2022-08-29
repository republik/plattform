import { ElementConfigI } from '../../../custom-types'
import { FlyerTileIcon } from '../../../../Icons'

export const config: ElementConfigI = {
  structure: [
    { type: 'flyerMetaP', main: true },
    { type: 'flyerTopic' },
    { type: 'flyerTitle' },
    { type: 'flyerAuthor' },
    { type: ['paragraph', 'ul', 'ol'], repeat: true },
    {
      type: ['flyerPunchline', 'pullQuote', 'articlePreview', 'figure'],
    },
  ],
  attrs: {
    blockUi: {
      position: {
        top: 10,
        left: 10,
      },
    },
  },
  button: { icon: FlyerTileIcon },
}
