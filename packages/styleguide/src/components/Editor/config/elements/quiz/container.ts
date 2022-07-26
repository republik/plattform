import { ElementConfigI } from '../../../custom-types'
import { QuizIcon } from '../../../../Icons'

export const config: ElementConfigI = {
  component: 'quiz',
  structure: [{ type: 'quizItem', repeat: true, main: true }],
  button: { icon: QuizIcon },
}
