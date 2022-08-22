import { ElementConfigI } from '../../../custom-types'
import { FlyerTileMetaIcon } from '../../../../Icons'

export const config: ElementConfigI = {
  structure: [{ type: 'flyerMetaP', main: true, repeat: true }],
  attrs: {
    blockUi: {
      position: {
        top: 0,
        left: 0,
      },
    },
  },
  button: { icon: FlyerTileMetaIcon },
}
