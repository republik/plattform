import { ElementConfigI } from '../../../custom-types'
import { FlyerTileMetaIcon } from '../../../../Icons'
import { baseConfig } from './index'

export const config: ElementConfigI = {
  ...baseConfig,
  structure: [{ type: 'flyerMetaP', main: true, repeat: true }],
  button: { icon: FlyerTileMetaIcon },
}
