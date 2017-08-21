import React from 'react'
import { matchMark, pluginFromRules } from '../../utils'
import {
  BoldButton,
  ItalicButton,
  UnderlineButton,
  StrikethroughButton
} from './ui'
import { BOLD, ITALIC, UNDERLINE, STRIKETHROUGH } from './constants'

const bold = {
  match: matchMark(BOLD),
  render: ({ children }) => <strong>{ children }</strong>
}

const italic = {
  match: matchMark(ITALIC),
  render: ({ children }) => <em>{ children }</em>
}

const underline = {
  match: matchMark(UNDERLINE),
  render: ({ children }) => <u>{ children }</u>
}

const strikethrough = {
  match: matchMark(STRIKETHROUGH),
  render: ({ children }) => <del>{ children }</del>
}

export {
  BOLD,
  ITALIC,
  UNDERLINE,
  STRIKETHROUGH,
  BoldButton,
  ItalicButton,
  UnderlineButton,
  StrikethroughButton
}

export default {
  plugins: [
    pluginFromRules([
      bold,
      italic,
      underline,
      strikethrough
    ])
  ]
}
