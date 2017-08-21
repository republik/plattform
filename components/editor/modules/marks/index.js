import React from 'react'
import { matchMark, pluginFromRules } from '../../utils'
import {
  BoldButton,
  ItalicButton,
  UnderlineButton,
  StrikethroughButton
} from './ui'

export const BOLD = 'bold'

export const bold = {
  match: matchMark(BOLD),
  render: ({ children }) => <strong>{ children }</strong>
}

export const ITALIC = 'italic'

export const italic = {
  match: matchMark(ITALIC),
  render: ({ children }) => <em>{ children }</em>
}

export const UNDERLINE = 'underline'

export const underline = {
  match: matchMark(UNDERLINE),
  render: ({ children }) => <u>{ children }</u>
}

export const STRIKETHROUGH = 'strikethrough'

export const strikethrough = {
  match: matchMark(STRIKETHROUGH),
  render: ({ children }) => <del>{ children }</del>
}

export default {
  BoldButton,
  ItalicButton,
  UnderlineButton,
  StrikethroughButton,
  bold,
  italic,
  underline,
  strikethrough,
  plugins: [
    pluginFromRules([
      bold,
      italic,
      underline,
      strikethrough
    ])
  ]
}
