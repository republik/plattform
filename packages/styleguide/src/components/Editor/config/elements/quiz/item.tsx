import {
  ElementConfigI,
  ElementFormProps,
  QuizItemElement,
} from '../../../custom-types'
import React from 'react'
import Checkbox from '../../../../Form/Checkbox'

const Form: React.FC<ElementFormProps<QuizItemElement>> = ({
  element,
  onChange,
}) => (
  <div>
    <Checkbox
      checked={element.isCorrect}
      onChange={(_, checked) => onChange({ isCorrect: checked })}
    >
      correct answer
    </Checkbox>
  </div>
)

export const config: ElementConfigI = {
  component: 'quizItem',
  structure: [{ type: 'quizAnswer', main: true }, { type: 'quizAnswerInfo' }],
  props: ['isCorrect'],
  Form,
  attrs: {
    blockUi: {
      position: {
        top: 0,
        left: -50,
      },
    },
  },
}
