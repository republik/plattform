import { Editorial } from '../../../../Typography'
import { ElementConfigI } from '../../../custom-types'
import { ParagraphIcon } from '../../../../Icons'
import { CommentBodyParagraph } from '../../../../CommentBody/web'

export const config: ElementConfigI = {
  component: 'paragraph',
  structure: [{ type: ['text', 'link', 'break'], repeat: true }],
  attrs: {
    formatText: true,
  },
  button: { icon: ParagraphIcon },
}
