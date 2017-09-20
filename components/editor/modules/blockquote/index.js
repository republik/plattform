import React from 'react'
import { BlockquoteButton } from './ui'
import { matchBlock } from '../../utils'
import { BLOCKQUOTE } from './constants'
import MarkdownSerializer from '../../../../lib/serializer'
import addValidation from '../../utils/serializationValidation'
import { serializer as paragraphSerializer, PARAGRAPH } from '../paragraph'

const blockquote = {
  match: matchBlock(BLOCKQUOTE),
  matchMdast: (node) => node.type === 'blockquote',
  fromMdast: (node, index, parent, visitChildren) => ({
    kind: 'block',
    type: BLOCKQUOTE,
    nodes: paragraphSerializer.fromMdast(node.children)
  }),
  toMdast: (object, index, parent, visitChildren, context) => ({
    type: 'blockquote',
    children: paragraphSerializer.toMdast(object.nodes, context)
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

addValidation(blockquote, serializer, 'blockquote')

export {
  BLOCKQUOTE,
  BlockquoteButton
}

export default {
  plugins: [
    {
      schema: {
        rules: [
          {
            match: matchBlock(BLOCKQUOTE),
            validate: node => {
              const notPargraphs = node.nodes
                .filter(n => n.type !== PARAGRAPH)

              return notPargraphs.size
                ? notPargraphs
                : null
            },
            normalize: (transform, object, notPargraphs) => {
              notPargraphs.forEach(child => {
                if (child.kind === 'block') {
                  transform.unwrapNodeByKey(child.key)
                } else {
                  transform.wrapBlockByKey(child.key, PARAGRAPH)
                }
              })

              return transform
            }
          },
          blockquote
        ]
      }
    }
  ]
}
