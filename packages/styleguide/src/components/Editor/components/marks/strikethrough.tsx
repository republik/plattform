import { MarkConfigI } from '../../custom-types'
import { css } from 'glamor'
import { StrikeThrough } from '../../../Icons'

export const config: MarkConfigI = {
  styles: css({ textDecoration: 'line-through' }),
  button: { icon: StrikeThrough },
}
