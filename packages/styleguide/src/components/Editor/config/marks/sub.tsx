import { MarkConfigI } from '../../custom-types'
import { SubIcon } from '../../../Icons'

export const config: MarkConfigI = {
  component: 'sub',
  remove: ['sup'],
  button: { icon: SubIcon, small: true },
}
