import { ElementConfigI } from '../../../custom-types'
import { FlyerTileMetaIcon } from '../../../../Icons'

export const config: ElementConfigI = {
  component: 'flyerTile',
  structure: [{ type: 'flyerMetaP', main: true, repeat: true }],
  attrs: {
    isBlock: true,
  },
  button: { icon: FlyerTileMetaIcon },
}
