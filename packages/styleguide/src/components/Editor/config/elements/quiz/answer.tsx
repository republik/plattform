import { ElementConfigI } from '../../../custom-types'
import React from 'react'

export const QuizAnswer: React.FC<{
  attributes: any
  [x: string]: unknown
}> = ({ children, attributes, ...props }) => (
  <div {...attributes} {...props}>
    <div
      className='quiz-answer'
      style={{
        fontFamily: 'Druk Text Wide Trial',
        fontStyle: 'Medium',
        fontSize: 23,
        padding: '12px 30px',
        borderWidth: 5,
        borderStyle: 'solid',
        display: 'inline-block',
      }}
    >
      {children}
    </div>
  </div>
)

export const config: ElementConfigI = {
  component: 'quizAnswer',
  structure: [{ type: ['text'], repeat: true }],
}
