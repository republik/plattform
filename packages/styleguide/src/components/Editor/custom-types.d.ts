import React, { ForwardRefExoticComponent } from 'react'
import { IconType } from '@react-icons/all-files/lib'
import { BaseEditor, Path } from 'slate'
import { ReactEditor } from 'slate-react'
import { HistoryEditor } from 'slate-history'
import { StyleAttribute } from 'glamor'

type CustomMarks = {
  italic?: boolean
  bold?: boolean
  sub?: boolean
  sup?: boolean
  strikethrough?: boolean
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

export type ListElement = SharedElement & {
  type: 'list'
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
  | 'list'
  | 'listItem'

interface ButtonI {
  icon: IconType
  small?: boolean
}

interface EditorAttrsI {
  isVoid?: boolean
  isInline?: boolean
}

interface ElementAttrsI extends EditorAttrsI {
  formatText?: boolean
  isMain?: boolean
}

export type EditorAttr = keyof EditorAttrsI

export type NormalizeFn<E> = (entry: [E, Path], editor: CustomEditor) => boolean

export interface MarkConfigI {
  styles: StyleAttribute
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
  Component: React.FC | ForwardRefExoticComponent
  attrs?: ElementAttrsI
  dataRequired?: dataRequiredType
  normalizations?: NormalizeFn[]
  structure?: NodeTemplate[]
  Form?: React.FC<ElementFormProps<CustomElement>>
  button?: ButtonI
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
  maxSigns: number
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

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor
    Element: CustomElement
    Text: CustomText
  }
}

declare module '@project-r/styleguide'
