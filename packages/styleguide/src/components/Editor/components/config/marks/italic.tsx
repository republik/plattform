import { MarkConfigI } from '../../../custom-types'
import { Editorial } from '../../../../Typography'
import { ItalicIcon } from '../../../../Icons'

export const config: MarkConfigI = {
  Component: {
    article: Editorial.Cursive,
  },
  button: { icon: ItalicIcon },
}
