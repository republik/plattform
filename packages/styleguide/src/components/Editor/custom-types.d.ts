import React, { ForwardRefExoticComponent } from 'react'
import { IconType } from '@react-icons/all-files/lib'
import { BaseEditor, Path } from 'slate'
import { ReactEditor } from 'slate-react'
import { HistoryEditor } from 'slate-history'

type MarkType = 'italic' | 'bold' | 'sub' | 'sup' | 'strikethrough'

type CustomMarks = {
  [K in MarkType]?: boolean
}

export type CustomMarksType = keyof CustomMarks

type PlainText = {
  text: string
  end?: boolean
  placeholder?: string
  template?: NodeTemplate
}

export type CustomText = CustomMarks & PlainText

type SharedElement = {
  children: (CustomElement | CustomText)[]
  template?: NodeTemplate
}

export type ParagraphElement = SharedElement & {
  type: 'paragraph'
}

export type HeadlineElement = SharedElement & {
  type: 'headline'
}

export type BreakElement = SharedElement & {
  type: 'break'
}

export type LinkElement = SharedElement & {
  type: 'link'
  href?: string
}

export type FigureElement = SharedElement & {
  type: 'figure'
  size?: string
}

export type Image = {
  url: string
}

export type FigureImages = {
  default?: Image
  dark?: Image
}

export type FigureImageElement = SharedElement & {
  type: 'figureImage'
  images?: FigureImages
  alt?: string
}

export type FigureCaptionElement = SharedElement & {
  type: 'figureCaption'
}

export type FigureBylineElement = SharedElement & {
  type: 'figureByline'
}

export type PullQuoteElement = SharedElement & {
  type: 'pullQuote'
}

export type PullQuoteTextElement = SharedElement & {
  type: 'pullQuoteText'
}

export type PullQuoteSourceElement = SharedElement & {
  type: 'pullQuoteSource'
}

export type BlockQuoteElement = SharedElement & {
  type: 'blockQuote'
}

export type BlockQuoteTextElement = SharedElement & {
  type: 'blockQuoteText'
}

export type ListElement = SharedElement & {
  type: 'ul' | 'ol'
  ordered?: boolean
}

export type ListItemElement = SharedElement & {
  type: 'listItem'
}

export type InlineCodeElement = SharedElement & {
  type: 'inlineCode'
}

export type BlockCodeElement = SharedElement & {
  type: 'blockCode'
}

export type FlyerTileOpeningElement = SharedElement & {
  type: 'flyerTileOpening'
}

export type FlyerTileClosingElement = SharedElement & {
  type: 'flyerTileClosing'
}

export type FlyerTileMetaElement = SharedElement & {
  type: 'flyerTileMeta'
}

export type FlyerTileElement = SharedElement & {
  type: 'flyerTile'
}

export type FlyerMetaPElement = SharedElement & {
  type: 'flyerMetaP'
}

export type FlyerTopicElement = SharedElement & {
  type: 'flyerTopic'
}

export type FlyerTitleElement = SharedElement & {
  type: 'flyerTitle'
}

export type FlyerAuthorElement = SharedElement & {
  type: 'flyerAuthor'
  authorId?: string
}

export type FlyerPunchlineElement = SharedElement & {
  type: 'flyerPunchline'
}

export type FlyerSignatureElement = SharedElement & {
  type: 'flyerSignature'
}

export type ArticlePreviewElement = SharedElement & {
  type: 'articlePreview'
}

export type QuizElement = SharedElement & {
  type: 'quiz'
}

export type QuizItemElement = SharedElement & {
  type: 'quizItem'
  isCorrect?: boolean
}

export type QuizAnswerElement = SharedElement & {
  type: 'quizAnswer'
}

export type QuizAnswerInfoElement = SharedElement & {
  type: 'quizAnswerInfo'
}

export type CustomElement =
  | HeadlineElement
  | ParagraphElement
  | BreakElement
  | LinkElement
  | FigureElement
  | FigureImageElement
  | FigureCaptionElement
  | FigureBylineElement
  | PullQuoteElement
  | PullQuoteTextElement
  | PullQuoteSourceElement
  | BlockQuoteElement
  | BlockQuoteTextElement
  | ListElement
  | ListItemElement
  | InlineCodeElement
  | BlockCodeElement
  | FlyerTileClosingElement
  | FlyerTileOpeningElement
  | FlyerTileMetaElement
  | FlyerTileElement
  | FlyerMetaPElement
  | FlyerTopicElement
  | FlyerTitleElement
  | FlyerAuthorElement
  | FlyerPunchlineElement
  | FlyerSignatureElement
  | ArticlePreviewElement
  | QuizElement
  | QuizItemElement
  | QuizAnswerElement
  | QuizAnswerInfoElement

export type CustomDescendant = CustomElement | CustomText
export type CustomAncestor = CustomElement | CustomEditor

export type CustomNode = CustomEditor | CustomDescendant

export type CustomElementsType =
  | 'headline'
  | 'paragraph'
  | 'break'
  | 'link'
  | 'figure'
  | 'figureImage'
  | 'figureCaption'
  | 'figureByline'
  | 'pullQuote'
  | 'pullQuoteText'
  | 'pullQuoteSource'
  | 'blockQuote'
  | 'blockQuoteText'
  | 'ul'
  | 'ol'
  | 'listItem'
  | 'inlineCode'
  | 'blockCode'
  | 'flyerTileOpening'
  | 'flyerTileClosing'
  | 'flyerTileMeta'
  | 'flyerTile'
  | 'flyerMetaP'
  | 'flyerTopic'
  | 'flyerTitle'
  | 'flyerAuthor'
  | 'flyerPunchline'
  | 'flyerSignature'
  | 'articlePreview'
  | 'quiz'
  | 'quizItem'
  | 'quizAnswer'
  | 'quizAnswerInfo'

// include overlapping types (e.g. ol and ul both want to render 'list'
// include 'container' type
export type ExtendedElementType = CustomElementsType | 'list' | 'container'

interface ButtonI {
  icon: IconType
  small?: boolean
}

interface EditorAttrsI {
  isVoid?: boolean
  isInline?: boolean
}

export interface BlockUiAttrsI {
  position: object
}

interface ElementAttrsI extends EditorAttrsI {
  formatText?: boolean
  blockUi?: BlockUiAttrsI
  isTextInline?: boolean
  highlightSelected?: boolean
}

export type EditorAttr = keyof EditorAttrsI

export type NormalizeFn<E> = (entry: [E, Path], editor: CustomEditor) => boolean

type SchemaComponent =
  | React.FC<{
      attributes: any
      [x: string]: unknown
    }>
  | ForwardRefExoticComponent

type SchemaConfig = {
  [K in CustomMarksType | ExtendedElementType]?: SchemaComponent
}

export interface MarkConfigI {
  component: MarkType
  remove?: MarkType[]
  button?: ButtonI
}

export type MarksConfig = {
  [K in CustomMarksType]: MarkConfigI
}

export type ElementFormProps<E> = {
  element: E
  onChange: (newProperties: Partial<E>) => void
  onClose: () => void
}

export type TemplateType = CustomElementsType | 'text'

export type NodeTemplate = {
  type: TemplateType | TemplateType[]
  main?: boolean
  repeat?: boolean
  end?: boolean
}

export interface ElementConfigI {
  component: ExtendedElementType
  attrs?: ElementAttrsI
  normalizations?: NormalizeFn[]
  structure?: NodeTemplate[]
  Form?: React.FC<ElementFormProps<CustomElement>>
  button?: ButtonI
  defaultProps?: any
  props?: string[]
}

export type ElementsConfig = {
  [K in CustomElementsType]?: ElementConfigI
}

export interface DraftI {
  title: string
  id: string
  value: CustomElement[]
}

interface ToolbarConfig {
  mode?: ToolbarMode
  style?: object
  showChartCount?: boolean
  alsoRender?: React.FC
}

export type EditorConfig = {
  schema: SchemaConfig
  editorSchema?: SchemaConfig
  maxSigns?: number
  debug?: boolean
  toolbar?: ToolbarConfig
}

export type KeyCombo = {
  name: string
  shift?: boolean
}

export type ButtonConfig = {
  type: CustomElementsType | CustomMarksType
  disabled?: boolean
  active?: boolean
}

export type ToolbarMode = 'fixed' | 'sticky' | 'floating'

export type CustomEditor = BaseEditor &
  ReactEditor &
  HistoryEditor & { customConfig?: EditorConfig }

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor
    Element: CustomElement
    Text: CustomText
  }
}

declare module '@project-r/styleguide'
