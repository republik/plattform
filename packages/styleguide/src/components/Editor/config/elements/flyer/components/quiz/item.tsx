import React from 'react'
import {
  ElementConfigI,
  ElementFormProps,
  QuizItemElement,
} from '../../../../../custom-types'
import Checkbox from '../../../../../../Form/Checkbox'

const Form: React.FC<ElementFormProps<QuizItemElement>> = ({
  element,
  onChange,
}) => (
  <div>
    <Checkbox
      checked={element.isCorrect || false}
      onChange={(_, checked) => onChange({ isCorrect: checked })}
    >
      Diese Antwort ist richtig.
    </Checkbox>
  </div>
)

export const config: ElementConfigI = {
  structure: [{ type: 'quizAnswer', main: true }, { type: 'quizAnswerInfo' }],
  props: ['isCorrect'],
  Form,
  attrs: {
    blockUi: {
      style: {
        top: 55,
      },
    },
  },
}
