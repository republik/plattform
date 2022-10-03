import React, { useMemo, useState } from 'react'
import { css } from 'glamor'
import { plainButtonRule } from '../Button'
import schema from '../Editor/schema/flyer'
import { Message } from '../Editor/Render/Message'
import { RenderedElement } from '../Editor/Render'
import { isSlateElement } from '../Editor/Render/helpers'
import { fontFamilies } from '../../theme/fonts'
import { useColorContext } from '../Colors/ColorContext'
import { mUp } from '../../theme/mediaQueries'
import colors from '../../theme/colors'

const styles = {
  answersContainer: css({
    backgroundColor: '#ffffff',
    padding: 15,
    width: '100%',
    marginBottom: 15,
    [mUp]: {
      padding: 30,
      marginBottom: 30,
    },
  }),
  answerOuter: css({
    display: 'block',
    width: '100%',
    '&:not(:last-child)': {
      marginBottom: 15,
      [mUp]: {
        marginBottom: 30,
      },
    },
  }),
  answerInner: css({
    fontFamily: fontFamilies.sansSerifMedium,
    width: '100%',
    fontSize: 17,
    padding: 15,
    display: 'block',
    [mUp]: {
      fontSize: 23,
      padding: '25px 30px',
    },
  }),
}

export const EditorQuizItem: React.FC<{
  isCorrect?: boolean
  attributes: any
  [x: string]: unknown
}> = ({ children, isCorrect, attributes, ...props }) => {
  const [colorScheme] = useColorContext()
  const colorRule = useMemo(
    () =>
      css({
        '& .quiz-answer': {
          color: '#fff',
          backgroundColor: colorScheme.getCSSColor(
            isCorrect ? 'primary' : 'flyerFormatText',
          ),
          border: '15px solid #fff',
          marginBottom: 15,
          [mUp]: {
            borderWidth: 30,
            marginBottom: 30,
          },
        },
      }),
    [colorScheme, isCorrect],
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
    <div className='quiz-answer' {...styles.answerInner}>
      {children}
    </div>
  </div>
)

export const Quiz = ({ children, attributes, ...props }) => {
  const [colorScheme] = useColorContext()
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
      <div
        {...styles.answersContainer}
        style={{
          backgroundColor: answer?.isCorrect
            ? '#EBFFE0'
            : answer
            ? '#FFE0E0'
            : colors.light.default,
        }}
      >
        {tree.map((answer, i) => {
          const isSelected = answerId === i
          const primaryColor =
            isSelected && answer.isCorrect
              ? colors.light.primary
              : isSelected
              ? colors.light.flyerFormatText
              : undefined
          const colorRule = css({
            color: isSelected ? '#fff' : colors.light.text,
            backgroundColor: primaryColor || '#fff',
            border: `1px solid ${primaryColor || '#000'}`,
            '@media (hover)': {
              ':hover': {
                color: '#fff',
                backgroundColor: primaryColor || '#000',
              },
            },
          })

          return (
            <button
              key={i}
              onClick={() => setAnswerId(i)}
              {...plainButtonRule}
              {...colorRule}
              {...styles.answerOuter}
            >
              <RenderedElement element={answer.children[0]} schema={schema} />
            </button>
          )
        })}
      </div>
      {isSlateElement(answerInfo) && (
        <RenderedElement element={answerInfo} schema={schema} />
      )}
    </div>
  )
}
