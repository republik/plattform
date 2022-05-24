import { MarkConfigI } from '../../../custom-types'
import { css } from 'glamor'
import { StrikeThrough } from '../../../../Icons'

export const config: MarkConfigI = {
  styles: {
    article: css({ textDecoration: 'line-through' }),
  },
  button: { icon: StrikeThrough },
}
