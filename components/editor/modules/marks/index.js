import React from 'react'
import { matchMark } from '../../utils'
import {
  BoldButton,
  ItalicButton,
  UnderlineButton,
  StrikethroughButton
} from './ui'
import { BOLD, ITALIC, UNDERLINE, STRIKETHROUGH } from './constants'

const bold = {
  match: matchMark(BOLD),
  matchMdast: (node) => node.type === 'strong',
  fromMdast: (node, index, parent, visitChildren) => ({
    kind: 'mark',
    type: BOLD,
    nodes: visitChildren(node)
  }),
  toMdast: (mark, index, parent, visitChildren) => ({
    type: 'strong',
    children: visitChildren(mark)
  }),
  render: ({ children, attributes }) => <strong {...attributes}>{ children }</strong>
}

const italic = {
  match: matchMark(ITALIC),
  matchMdast: (node) => node.type === 'emphasis',
  fromMdast: (node, index, parent, visitChildren) => ({
    kind: 'mark',
    type: ITALIC,
    nodes: visitChildren(node)
  }),
  toMdast: (mark, index, parent, visitChildren) => ({
    type: 'emphasis',
    children: visitChildren(mark)
  }),
  render: ({ children, attributes }) => <em {...attributes}>{ children }</em>
}

const underline = {
  match: matchMark(UNDERLINE),
  render: ({ children, attributes }) => <u {...attributes}>{ children }</u>
}

const strikethrough = {
  match: matchMark(STRIKETHROUGH),
  matchMdast: (node) => node.type === 'delete',
  fromMdast: (node, index, parent, visitChildren) => ({
    kind: 'mark',
    type: STRIKETHROUGH,
    nodes: visitChildren(node)
  }),
  toMdast: (mark, index, parent, visitChildren) => ({
    type: 'delete',
    children: visitChildren(mark)
  }),
  render: ({ children, attributes }) => <del {...attributes}>{ children }</del>
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
    {
      schema: {
        rules: [
          bold,
          italic,
          underline,
          strikethrough
        ]
      }
    }
  ]
}
