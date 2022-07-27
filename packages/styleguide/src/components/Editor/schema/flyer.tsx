import React, { useState } from 'react'
import { SchemaConfig } from '../custom-types'
import { FigureByline, FigureCaption } from '../../Figure'
import { FigureContainer } from '../config/elements/figure/container'
import { FigureImage } from '../config/elements/figure/image'
import { List } from '../config/elements/list/container'
import { ListItem } from '../../List'
import { PullQuoteSource } from '../../PullQuote'
import { Break } from '../config/elements/break'
import { Editorial, Sub, Sup, Interaction } from '../../Typography'
import { NoRefA } from '../config/elements/link'
import { FlyerTile } from '../config/elements/flyer'
import { FlyerAuthor } from '../config/elements/flyer/elements/author'
import { FlyerMetaP } from '../config/elements/flyer/elements/metaP'
import { FlyerTitle } from '../config/elements/flyer/elements/title'
import { FlyerTopic } from '../config/elements/flyer/elements/topic'
import { useColorContext } from '../../Colors/ColorContext'
import { FlyerSignature } from '../config/elements/flyer/elements/signature'
import { ContainerComponent } from '../components/editor/ui/Element'
import { ArticlePreview } from '../config/elements/articlePreview'
import { QuizAnswer } from '../config/elements/quiz/answer'
import { EditorQuizItem } from '../config/elements/quiz/item'
import {
  CORRECT_COLOR,
  EditorQuizContainer,
  WRONG_COLOR,
} from '../config/elements/quiz/container'
import { plainButtonRule } from '../../Button'
import { RenderedElement } from '../components/render'
import { Element as SlateElement } from 'slate'

const container = ({ children, attributes }) => (
  <div style={{ backgroundColor: '#FFE501' }} {...attributes}>
    {children}
  </div>
)

const Headline = ({ children, attributes, ...props }) => (
  <h1
    {...attributes}
    {...props}
    style={{
      fontFamily: 'Druk Text Wide Trial',
      fontStyle: 'Medium',
      fontSize: 60,
      textAlign: 'center',
      marginBottom: 50,
    }}
  >
    {children}
  </h1>
)

const Paragraph = ({ children, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <p
      {...props}
      style={{
        fontFamily: 'GT America',
        fontWeight: 400,
        fontSize: 24,
        marginBottom: 20,
        ...props.style,
      }}
      {...colorScheme.set('color', 'text')}
    >
      {children}
    </p>
  )
}

const PullQuote = ({ children, attributes }) => (
  <blockquote {...attributes}>{children}</blockquote>
)

const PullQuoteText = ({ children, attributes }) => (
  <div
    {...attributes}
    style={{
      backgroundColor: '#0E755A',
      color: 'white',
      fontFamily: 'GT America',
      fontWeight: 700,
      fontSize: 40,
      textAlign: 'center',
      padding: 20,
    }}
  >
    <q
      style={{
        quotes: `"«" "»" "‹" "›"`,
      }}
    >
      {children}
    </q>
  </div>
)

const Quiz = ({ children, attributes, ...props }) => {
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
      {SlateElement.isElement(answerInfo) && (
        <RenderedElement element={answerInfo} schema={schema} />
      )}
    </div>
  )
}

export const editorSchema: SchemaConfig = {
  quizItem: EditorQuizItem,
  quiz: EditorQuizContainer,
}

export const schema: SchemaConfig = {
  container,
  flyerTile: FlyerTile,
  flyerAuthor: FlyerAuthor,
  flyerMetaP: FlyerMetaP,
  flyerPunchline: FigureCaption,
  flyerSignature: FlyerSignature,
  flyerTitle: FlyerTitle,
  flyerTopic: FlyerTopic,
  articlePreview: ArticlePreview,
  figureByline: FigureByline,
  figureCaption: FigureCaption,
  figure: FigureContainer,
  figureImage: FigureImage,
  list: List,
  listItem: ListItem,
  pullQuote: PullQuote,
  pullQuoteSource: PullQuoteSource,
  pullQuoteText: PullQuoteText,
  break: Break,
  headline: Headline,
  link: NoRefA,
  paragraph: Paragraph,
  bold: Interaction.Emphasis,
  italic: Interaction.Cursive,
  strikethrough: Editorial.StrikeThrough,
  sub: Sub,
  sup: Sup,
  quiz: Quiz,
  quizAnswer: QuizAnswer,
  quizAnswerInfo: ContainerComponent,
}
