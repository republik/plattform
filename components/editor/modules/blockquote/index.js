import React from 'react'
import { BlockquoteButton } from './ui'
import { matchBlock } from '../../utils'
import { BLOCKQUOTE } from './constants'
import MarkdownSerializer from '../../../../lib/serializer'
import { serializer as paragraphSerializer } from '../paragraph'

const blockquote = {
  match: matchBlock(BLOCKQUOTE),
  matchMdast: (node) => node.type === 'blockquote',
  fromMdast: (node, index, parent, visitChildren) => ({
    kind: 'block',
    type: BLOCKQUOTE,
    nodes: paragraphSerializer.fromMdast(node.children)
  }),
  toMdast: (object, index, parent, visitChildren) => ({
    type: 'blockquote',
    children: paragraphSerializer.toMdast(object.nodes)
  }),
  render: ({ children }) =>
    <blockquote>
      {children}
    </blockquote>
}

export const serializer = new MarkdownSerializer({
  rules: [
    blockquote
  ]
})

export {
  BLOCKQUOTE,
  BlockquoteButton
}

export default {
  plugins: [
    {
      schema: {
        rules: [
          blockquote
        ]
      }
    }
  ]
}
