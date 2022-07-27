import { ElementConfigI } from '../../../custom-types'
import { QuizIcon } from '../../../../Icons'
import React from 'react'
import { Message } from '../../../components/editor/ui/ErrorMessage'

export const CORRECT_COLOR = '#0E755A'
export const WRONG_COLOR = '#D50032'

export const EditorQuizContainer: React.FC<{
  attributes: any
  [x: string]: unknown
}> = ({ props, attributes, children }) => {
  return (
    <div {...props} {...attributes} style={{ position: 'relative' }}>
      <Message
        text='Quiz solution depends on answer choice. Check preview for final
        layout.'
      />
      {children}
    </div>
  )
}

export const config: ElementConfigI = {
  component: 'quiz',
  structure: [{ type: 'quizItem', repeat: true, main: true }],
  button: { icon: QuizIcon },
}
