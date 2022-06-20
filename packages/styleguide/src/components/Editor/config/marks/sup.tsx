import { MarkConfigI } from '../../custom-types'
import { SupIcon } from '../../../Icons'

export const config: MarkConfigI = {
  component: 'sup',
  remove: ['sub'],
  button: { icon: SupIcon, small: true },
}
