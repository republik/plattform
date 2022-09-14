import { ElementConfigI } from '../../../custom-types'
import { baseConfig } from './index'

export const config: ElementConfigI = {
  ...baseConfig,
  structure: [
    { type: 'flyerDate' },
    { type: 'headline' },
    { type: 'flyerOpeningP', repeat: true },
  ],
}
