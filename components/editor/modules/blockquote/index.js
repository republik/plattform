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
      onKeyDown (event, data, change) {
        const isBackspace = event.key === 'Backspace'
        if (event.key !== 'Enter' && !isBackspace) return

        const { state } = change
        const inBlockquote = state.document.getClosest(
          state.startBlock.key,
          matchBlock(BLOCKQUOTE)
        )
        if (!inBlockquote) return

        event.preventDefault()

        const isEmpty = !state.startBlock.text

        if (isEmpty && (!isBackspace || inBlockquote.nodes.size === 1)) {
          return change
            .unwrapBlock()
        }

        if (isBackspace) {
          return change.deleteBackward()
        }

        return change
          .splitBlock(2)
      },
      schema: {
        rules: [
          {
            match: matchBlock(BLOCKQUOTE),
            validate: node => {
              const notParagraphs = node.nodes
                .filter(n => n.type !== PARAGRAPH)

              return notParagraphs.size
                ? notParagraphs
                : null
            },
            normalize: (change, object, notParagraphs) => {
              notParagraphs.forEach(child => {
                if (child.kind === 'block') {
                  change.unwrapNodeByKey(child.key)
                } else {
                  change.wrapBlockByKey(child.key, PARAGRAPH)
                }
              })

              return change
            }
          },
          blockquote
        ]
      }
    }
  ]
}
