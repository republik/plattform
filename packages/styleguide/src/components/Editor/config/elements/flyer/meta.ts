import { IconFlyerTileMeta } from '@republik/icons'
import { ElementConfigI } from '../../../custom-types'
import { baseConfig } from './index'

export const config: ElementConfigI = {
  ...baseConfig,
  structure: [{ type: 'flyerMetaP', main: true, repeat: true }],
  button: { icon: IconFlyerTileMeta },
}
