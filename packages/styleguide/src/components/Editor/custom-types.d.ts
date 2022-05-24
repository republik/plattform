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

export type FigureImageElement = SharedElement & {
  type: 'figureImage'
  src?: string
  srcDark?: string
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
  highlightSelected?: boolean
}

interface ElementAttrsI extends EditorAttrsI {
  formatText?: boolean
  isMain?: boolean
}

export type EditorAttr = keyof EditorAttrsI

export type NormalizeFn<E> = (entry: [E, Path], editor: CustomEditor) => boolean

type SchemaComponent =
  | React.FC<{
      attributes: any
      children: any
      [x: string]: unknown
    }>
  | ForwardRefExoticComponent

type SchemaConfig = {
  [K in CustomMarksType | ExtendedElementType]?: SchemaComponent
}

export interface MarkConfigI {
  component: MarkType
  button?: ButtonI
}

export type MarksConfig = {
  [K in CustomMarksType]: NodeConfigI
}

export type ElementFormProps<E> = {
  element: E
  onChange: (newProperties: Partial<E>) => void
}

export type dataRequiredType<E> = (keyof E)[]

export type TemplateType = CustomElementsType | 'text'

export type NodeTemplate = {
  type: TemplateType | TemplateType[]
  repeat?: boolean
  end?: boolean
}

export interface ElementConfigI {
  component: ExtendedElementType
  attrs?: ElementAttrsI
  dataRequired?: dataRequiredType
  normalizations?: NormalizeFn[]
  structure?: NodeTemplate[]
  Form?: React.FC<ElementFormProps<CustomElement>>
  button?: ButtonI
  defaultProps?: any
}

export type ElementsConfig = {
  [K in CustomElementsType]?: ElementConfigI
}

export interface DraftI {
  title: string
  id: string
  value: CustomElement[]
}

export type EditorConfig = {
  schema: SchemaConfig
  maxSigns?: number
  debug?: boolean
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

export type ToolbarMode = 'sticky' | 'floating'

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
