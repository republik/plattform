import { IconQuiz } from '@republik/icons'
import { ElementConfigI } from '../../../../../custom-types'

export const config: ElementConfigI = {
  structure: [{ type: 'quizItem', repeat: true, main: true }],
  button: { icon: IconQuiz },
  attrs: {
    stopFormIteration: true,
  },
}
