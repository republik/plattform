import { Editorial } from '../../../../Typography'
import { ElementConfigI } from '../../../custom-types'
import { ParagraphIcon } from '../../../../Icons'

export const config: ElementConfigI = {
  Component: Editorial.P,
  structure: [{ type: ['text', 'link', 'break'], repeat: true }],
  attrs: {
    formatText: true,
  },
  button: { icon: ParagraphIcon },
}
