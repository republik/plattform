import React, { ForwardRefExoticComponent } from 'react'
import { BaseEditor, BaseRange, Path } from 'slate'
import { ReactEditor } from 'slate-react'
import { HistoryEditor } from 'slate-history'
import { Formatter } from '../../lib/translate'
import { MarkerType } from '../Marker'
import { IconType } from '../../types/icon'

type MarkType =
  | 'italic'
  | 'bold'
  | 'sub'
  | 'sup'
  | 'strikethrough'
  | 'invisible'
  | 'error'

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
  voidId?: string
}

export type LinkElement = SharedElement & {
  type: 'link'
  href?: string
  title?: string
}

export type MemoElement = SharedElement & {
  type: 'memo'
  parentId?: string
  marker?: MarkerType
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
  voidId?: string
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

type TileElement = {
  id: string
}

export type FlyerTileOpeningElement = SharedElement &
  TileElement & {
    type: 'flyerTileOpening'
  }

export type FlyerTileClosingElement = SharedElement &
  TileElement & {
    type: 'flyerTileClosing'
  }

export type FlyerTileMetaElement = SharedElement &
  TileElement & {
    type: 'flyerTileMeta'
  }

export type FlyerTileElement = SharedElement &
  TileElement & {
    type: 'flyerTile'
  }

export type FlyerMetaPElement = SharedElement & {
  type: 'flyerMetaP'
}

export type FlyerOpeningPElement = SharedElement & {
  type: 'flyerOpeningP'
}

export type FlyerTopicElement = SharedElement & {
  type: 'flyerTopic'
}

export type FlyerTitleElement = SharedElement & {
  type: 'flyerTitle'
}

export type ResolvedAuthor = {
  name: string
  portrait: string
  slug: string
  status?: 'exists' | 'missing'
}

export type FlyerAuthorElement = SharedElement & {
  type: 'flyerAuthor'
  authorId?: string
  resolvedAuthor?: ResolvedAuthor
  voidId?: string
}

export type FlyerPunchlineElement = SharedElement & {
  type: 'flyerPunchline'
}

export type FlyerSignatureElement = SharedElement & {
  type: 'flyerSignature'
}

export type FlyerDateElement = SharedElement & {
  type: 'flyerDate'
  date?: string
  voidId?: string
}

export type ArticleKind = 'editorial' | 'meta' | 'flyer' | 'scribble'

export type ArticlePreviewElement = SharedElement & {
  type: 'articlePreview'
  href?: string
  backgroundColor?: string
  color?: string
  kind?: ArticleKind
}

export type ArticlePreviewTextContainerElement = SharedElement & {
  type: 'articlePreviewTextContainer'
}

export type ArticlePreviewFormatElement = SharedElement & {
  type: 'articlePreviewFormat'
  href?: string
}

export type ArticlePreviewTitleElement = SharedElement & {
  type: 'articlePreviewTitle'
}

export type ArticlePreviewLeadElement = SharedElement & {
  type: 'articlePreviewLead'
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

export type QuizAnswerInfoPElement = SharedElement & {
  type: 'quizAnswerInfoP'
}

export type CustomElement =
  | HeadlineElement
  | ParagraphElement
  | BreakElement
  | LinkElement
  | MemoElement
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
  | FlyerOpeningPElement
  | FlyerMetaPElement
  | FlyerTopicElement
  | FlyerTitleElement
  | FlyerAuthorElement
  | FlyerPunchlineElement
  | FlyerSignatureElement
  | FlyerDateElement
  | ArticlePreviewElement
  | ArticlePreviewTextContainerElement
  | ArticlePreviewFormatElement
  | ArticlePreviewTitleElement
  | ArticlePreviewLeadElement
  | QuizElement
  | QuizItemElement
  | QuizAnswerElement
  | QuizAnswerInfoElement
  | QuizAnswerInfoPElement

export type CustomDescendant = CustomElement | CustomText
export type CustomAncestor = CustomElement | CustomEditor

export type CustomNode = CustomEditor | CustomDescendant

export type CustomElementsType =
  | 'headline'
  | 'paragraph'
  | 'break'
  | 'link'
  | 'memo'
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
  | 'flyerOpeningP'
  | 'flyerMetaP'
  | 'flyerTopic'
  | 'flyerTitle'
  | 'flyerAuthor'
  | 'flyerPunchline'
  | 'flyerSignature'
  | 'flyerDate'
  | 'articlePreview'
  | 'articlePreviewTextContainer'
  | 'articlePreviewFormat'
  | 'articlePreviewTitle'
  | 'articlePreviewLead'
  | 'quiz'
  | 'quizItem'
  | 'quizAnswer'
  | 'quizAnswerInfo'
  | 'quizAnswerInfoP'

interface ButtonI {
  icon: IconType
  small?: boolean
}

interface EditorAttrsI {
  isVoid?: boolean
  isInline?: boolean
}

export interface BlockUiAttrsI {
  style?: object
}

interface ElementAttrsI extends EditorAttrsI {
  formatText?: boolean
  blockUi?: BlockUiAttrsI
  isInlineBlock?: boolean
  stopFormIteration?: boolean
  neverDelete?: boolean
}

export type EditorAttr = keyof EditorAttrsI

export type NormalizeFn<E> = (entry: [E, Path], editor: CustomEditor) => boolean
export type DecorateFn<E> = (entry: [E, Path]) => BaseRange[]

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
  remove?: MarkType[]
  button?: ButtonI
}

export type MarksConfig = {
  [K in CustomMarksType]: MarkConfigI
}

export type ElementFormProps<E> = {
  element: E
  path?: Path
  onChange: (newProperties: Partial<E>) => void
  onClose: () => void
}

export type TemplateType = CustomElementsType | 'text' | 'inherit'

export type NodeTemplate = {
  type: TemplateType | TemplateType[]
  main?: boolean
  repeat?: boolean
  end?: boolean
}

export interface ElementConfigI {
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
}

export type EditorContext = {
  t?: Formatter
  Link?: React.FC<any>
  nav?: JSX.Element
  repoId?: string
  commitId?: string
}

export type EditorConfig = {
  schema: SchemaConfig
  editorSchema?: SchemaConfig
  structure?: NodeTemplate[]
  maxSigns?: number
  debug?: boolean
  toolbar?: ToolbarConfig
  readOnly?: boolean
  context: EditorContext
}

export type KeyCombo = {
  name: string
  shift?: boolean
}

export type CharConfig = {
  type: string
  insert: string
  render?: string
  renderStyle?: object
  buttonStyle?: React.CSSProperties
  isInvisible?: boolean
}

export type CharButtonConfig = {
  char: CharConfig
  disabled?: boolean
}

export type ButtonConfig = {
  type: CustomElementsType | CustomMarksType
  disabled?: boolean
  active?: boolean
}

export type ToolbarMode = 'fixed' | 'sticky'

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
