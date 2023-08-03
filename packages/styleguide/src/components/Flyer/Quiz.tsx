import React, { ReactNode, useMemo, useState } from 'react'
import { css } from 'glamor'
import { plainButtonRule } from '../Button'
import schema from '../Editor/schema/flyer'
import { Message } from '../Editor/Render/Message'
import { RenderedElement } from '../Editor/Render'
import { isSlateElement } from '../Editor/Render/helpers'
import { fontFamilies } from '../../theme/fonts'
import { ColorContextProvider, useColorContext } from '../Colors/ColorContext'
import { mUp } from '../../theme/mediaQueries'

const styles = {
  answersContainer: css({
    backgroundColor: '#ffffff',
    padding: 15,
    width: '100%',
    marginBottom: 15,
    '& p:last-child': {
      marginBottom: '0px !important',
    },
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
  children?: ReactNode
  isCorrect?: boolean
  attributes: any
  [x: string]: unknown
}> = ({ children, isCorrect, attributes, ...props }) => {
  const [colorScheme] = useColorContext()
  const colorRule = useMemo(
    () =>
      css({
        background: 'white',
        padding: '15px 15px 0',
        [mUp]: {
          padding: '30px 30px 0',
        },
        '&:last-child': {
          marginBottom: 15,
          paddingBottom: 15,
          [mUp]: {
            paddingBottom: 30,
            marginBottom: 30,
          },
        },
        '& p:last-of-type': {
          marginBottom: '0 !important',
        },
        '& .quiz-answer': {
          color: 'white',
          backgroundColor: colorScheme.getCSSColor(
            isCorrect ? 'primary' : 'flyerFormatText',
          ),
          marginBottom: 15,
          [mUp]: {
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
  children?: ReactNode
  props: any
  attributes: any
  [x: string]: unknown
}> = ({ props, attributes, children }) => {
  return (
    <div {...props} {...attributes} style={{ position: 'relative' }}>
      <Message text='Infos zu Antworten werden nur zur ausgewählten Option eingeblendet. Um Quiz final zu prüfen, «Vorschau»-Ansicht nutzen.' />
      {children}
    </div>
  )
}

export const QuizAnswer: React.FC<{
  children?: ReactNode
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
  const [answerId, setAnswerId] = useState<number>(null)
  const tree = children?.props?.nodes

  if (!tree) return null

  const answer = tree[answerId]
  const answerInfo = answer?.children?.[1]

  return (
    <div
      {...styles.answersContainer}
      style={{
        backgroundColor: answer?.isCorrect
          ? '#EBFFE0'
          : answer
          ? '#FFE0E0'
          : 'var(--color-light)'.default,
      }}
    >
      {tree.map((answer, i) => {
        const isSelected = answerId === i
        const primaryColor =
          isSelected && answer.isCorrect
            ? 'var(--color-light)'.primary
            : isSelected
            ? 'var(--color-light)'.flyerFormatText
            : undefined
        const colorRule = css({
          color: isSelected ? '#fff' : 'var(--color-light)'.text,
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
      {isSlateElement(answerInfo) && (
        <ColorContextProvider colorSchemeKey='light'>
          <RenderedElement element={answerInfo} schema={schema} />
        </ColorContextProvider>
      )}
    </div>
  )
}
