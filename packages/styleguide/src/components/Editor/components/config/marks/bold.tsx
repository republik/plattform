import { MarkConfigI } from '../../../custom-types'
import { Editorial } from '../../../../Typography'
import { BoldIcon } from '../../../../Icons'

export const config: MarkConfigI = {
  Component: {
    article: Editorial.Emphasis,
  },
  button: { icon: BoldIcon },
}
