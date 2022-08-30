import { ElementConfigI } from '../../../custom-types'
import { baseConfig } from './index'

export const config: ElementConfigI = {
  ...baseConfig,
  structure: [{ type: 'headline' }, { type: 'flyerMetaP', repeat: true }],
}
