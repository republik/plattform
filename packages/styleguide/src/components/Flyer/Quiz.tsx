import React, { useMemo, useState } from 'react'
import { css } from 'glamor'
import { plainButtonRule } from '../Button'
import schema from '../Editor/schema/flyer'
import { Message } from '../Editor/Render/Message'
import { RenderedElement } from '../Editor/Render'
import { isSlateElement } from '../Editor/Render/helpers'

const WRONG_COLOR = '#D50032'
const CORRECT_COLOR = '#0E755A'

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

export const EditorQuizContainer: React.FC<{
  props: any
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

export const Quiz = ({ children, attributes, ...props }) => {
  const [answerId, setAnswerId] = useState<number>(null)
  const tree = children?.props?.nodes

  if (!tree) return null

  const answer = tree[answerId]
  const answerInfo = answer?.children?.[1]

  return (
    <div
      {...props}
      {...attributes}
      style={{ position: 'relative' }}
      contentEditable={false}
    >
      {tree.map((answer, i) => {
        const isSelected = answerId === i
        const color =
          isSelected && answer?.isCorrect
            ? CORRECT_COLOR
            : isSelected
            ? WRONG_COLOR
            : 'inherit'
        return (
          <button
            key={i}
            onClick={() => setAnswerId(i)}
            {...plainButtonRule}
            style={{ color, borderColor: color }}
          >
            <RenderedElement element={answer.children[0]} schema={schema} />
          </button>
        )
      })}
      {isSlateElement(answerInfo) && (
        <RenderedElement element={answerInfo} schema={schema} />
      )}
    </div>
  )
}
