import { ElementConfigI } from '../../../../../custom-types'
import { QuizIcon } from '../../../../../../Icons'

export const config: ElementConfigI = {
  structure: [{ type: 'quizItem', repeat: true, main: true }],
  button: { icon: QuizIcon },
  attrs: {
    stopFormIteration: true,
  },
}
