import { ElementConfigI } from '../../custom-types'
import { CodeIcon } from '../../../Icons'

export const config: ElementConfigI = {
  component: 'inlineCode',
  attrs: {
    isInline: true,
    isTextInline: true,
  },
  button: { icon: CodeIcon },
}
