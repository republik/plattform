import { ElementConfigI } from '../../../../../custom-types'
import Form from './Form'

export const config: ElementConfigI = {
  Form,
  props: ['authorId', 'resolvedAuthor'],
  attrs: {
    isVoid: true,
  },
}
