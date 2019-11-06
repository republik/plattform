import React from 'react'

import { matchBlock, createBlockButton, buttonStyles } from '../../utils'
import MarkdownSerializer from 'slate-mdast-serializer'
import { createStaticKeyHandler } from '../../utils/keyHandlers'

export default ({ rule, subModules, TYPE }) => {
  const paragraphModule = subModules.find(m => m.name === 'paragraph')
  if (!paragraphModule) {
    throw new Error('Missing paragraph submodule')
  }
  const paragraphSerializer = paragraphModule.helpers.serializer

  const { mdastType = 'blockquote', formatButtonText, identifier, isStatic } =
    rule.editorOptions || {}

  const schemaRule = {
    match: matchBlock(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: (node, index, parent, rest) => ({
      kind: 'block',
      type: TYPE,
      data: node.data,
      nodes: paragraphSerializer.fromMdast(node.children, 0, node, rest)
    }),
    toMdast: (object, index, parent, rest) => ({
      type: mdastType,
      identifier,
      data: object.data,
      children: paragraphSerializer.toMdast(object.nodes, 0, object, rest)
    })
  }

  const serializer = new MarkdownSerializer({
    rules: [schemaRule]
  })

  const Component = rule.component

  const staticHandler =
    isStatic && createStaticKeyHandler({ TYPE, rule: rule || {} })

  return {
    TYPE,
    rule,
    helpers: {
      serializer
    },
    changes: {},
    ui: {
      blockFormatButtons: [
        formatButtonText &&
          createBlockButton({
            type: TYPE
          })(({ active, disabled, visible, ...props }) => (
            <span
              {...buttonStyles.block}
              {...props}
              data-active={active}
              data-disabled={disabled}
              data-visible={visible}
            >
              {formatButtonText}
            </span>
          ))
      ]
    },
    plugins: [
      {
        renderNode({ node, children, attributes }) {
          if (!schemaRule.match(node)) return

          return <Component attributes={attributes}>{children}</Component>
        },
        onKeyDown(...args) {
          const [event, change] = args

          const isBackspace = event.key === 'Backspace'
          const isEnter = event.key === 'Enter'
          if (!isEnter && !isBackspace) return

          const { value } = change
          const inBlock = value.document.getClosest(
            value.startBlock.key,
            matchBlock(TYPE)
          )
          if (!inBlock) return

          event.preventDefault()

          const isEmpty = !value.startBlock.text

          if (isEmpty && (!isBackspace || inBlock.nodes.size === 1)) {
            return change.unwrapBlock()
          }

          if (isBackspace) {
            return change.deleteBackward()
          }

          if (staticHandler) {
            return staticHandler(...args)
          }

          return change.splitBlock(2)
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
              normalize: (change, reason, { node, index, child }) => {
                if (reason === 'child_type_invalid') {
                  change.setNodeByKey(child.key, { type: paragraphModule.TYPE })
                }
                if (reason === 'child_kind_invalid') {
                  change.wrapBlockByKey(child.key, {
                    type: paragraphModule.TYPE
                  })
                }
              }
            }
          }
        }
      }
    ]
  }
}
