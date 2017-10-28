import React from 'react'

import { matchBlock, createBlockButton, buttonStyles } from '../../utils'
import MarkdownSerializer from '../../../../lib/serializer'
import addValidation from '../../utils/serializationValidation'

export default ({rule, subModules, TYPE}) => {
  const paragraphModule = subModules.find(m => m.name === 'paragraph')
  if (!paragraphModule) {
    throw new Error('Missing paragraph submodule')
  }
  const paragraphSerializer = paragraphModule.helpers.serializer
  const PARAGRAPH = paragraphModule.TYPE

  const blockquote = {
    match: matchBlock(TYPE),
    matchMdast: (node) => node.type === 'blockquote',
    fromMdast: (node, index, parent, visitChildren) => ({
      kind: 'block',
      type: TYPE,
      nodes: paragraphSerializer.fromMdast(node.children)
    }),
    toMdast: (object, index, parent, visitChildren, context) => ({
      type: 'blockquote',
      children: paragraphSerializer.toMdast(object.nodes, context)
    }),
    render: rule.component
  }

  const serializer = new MarkdownSerializer({
    rules: [
      blockquote
    ]
  })

  addValidation(blockquote, serializer, TYPE)

  return {
    TYPE,
    helpers: {
      serializer
    },
    changes: {},
    ui: {
      blockFormatButtons: [
        createBlockButton({
          type: TYPE
        })(
          ({ active, disabled, visible, ...props }) =>
            <span
              {...buttonStyles.block}
              {...props}
              data-active={active}
              data-disabled={disabled}
              data-visible={visible}
              >
              Zitat
            </span>
        )
      ]
    },
    plugins: [
      {
        onKeyDown (event, change) {
          const isBackspace = event.key === 'Backspace'
          if (event.key !== 'Enter' && !isBackspace) return

          const { state } = change
          const inBlockquote = state.document.getClosest(
            state.startBlock.key,
            matchBlock(TYPE)
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
              match: matchBlock(TYPE),
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
}
