import {
  ElementConfigI,
  ElementFormProps,
  QuizItemElement,
} from '../../../custom-types'
import React, { useMemo } from 'react'
import Checkbox from '../../../../Form/Checkbox'
import { CORRECT_COLOR, WRONG_COLOR } from './container'
import { css } from 'glamor'

export const EditorQuizItem: React.FC<{
  isCorrect?: boolean
  attributes: any
  [x: string]: unknown
}> = ({ children, isCorrect, attributes, ...props }) => {
  const colorRule = useMemo(
    () =>
      css({
        '& .quiz-answer': {
          color: isCorrect ? CORRECT_COLOR : WRONG_COLOR,
          borderColor: isCorrect ? CORRECT_COLOR : WRONG_COLOR,
        },
      }),
    [isCorrect],
  )

  return (
    <div {...props} {...colorRule} style={{ position: 'relative' }}>
      {children}
    </div>
  )
}

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
