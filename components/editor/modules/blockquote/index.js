import React from 'react'

import { matchBlock, createBlockButton, buttonStyles } from '../../utils'
import MarkdownSerializer from '../../../../lib/serializer'

export default ({rule, subModules, TYPE}) => {
  const paragraphModule = subModules.find(m => m.name === 'paragraph')
  if (!paragraphModule) {
    throw new Error('Missing paragraph submodule')
  }
  const paragraphSerializer = paragraphModule.helpers.serializer

  const blockquote = {
    match: matchBlock(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: (node, index, parent, visitChildren) => ({
      kind: 'block',
      type: TYPE,
      nodes: paragraphSerializer.fromMdast(node.children)
    }),
    toMdast: (object, index, parent, visitChildren, context) => ({
      type: 'blockquote',
      children: paragraphSerializer.toMdast(object.nodes, context)
    })
  }

  const serializer = new MarkdownSerializer({
    rules: [
      blockquote
    ]
  })

  const Blockquote = rule.component

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
        renderNode ({node, children, attributes}) {
          if (!blockquote.match(node)) return

          return (
            <Blockquote attributes={attributes}>
              {children}
            </Blockquote>
          )
        },
        onKeyDown (event, change) {
          const isBackspace = event.key === 'Backspace'
          if (event.key !== 'Enter' && !isBackspace) return

          const { value } = change
          const inBlockquote = value.document.getClosest(
            value.startBlock.key,
            matchBlock(TYPE)
          )
          if (!inBlockquote) return

          event.preventDefault()

          const isEmpty = !value.startBlock.text

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
          blocks: {
            [TYPE]: {
              nodes: [
                {
                  kinds: ['block'],
                  types: [paragraphModule.TYPE],
                  min: 1
                }
              ],
              normalize: (change, reason, {node, index, child}) => {
                if (reason === 'child_type_invalid') {
                  change.setNodeByKey(
                    child.key,
                    {type: paragraphModule.TYPE}
                  )
                }
                if (reason === 'child_kind_invalid') {
                  change.wrapBlockByKey(
                    child.key,
                    {type: paragraphModule.TYPE}
                  )
                }
              }
            }
          }
        }
      }
    ]
  }
}
