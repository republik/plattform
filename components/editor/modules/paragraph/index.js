import React from 'react'

import MarkdownSerializer from 'slate-mdast-serializer'
import { matchBlock, createBlockButton, buttonStyles } from '../../utils'
import Placeholder from '../../Placeholder'

export default ({rule, subModules, TYPE}) => {
  const {
    formatButtonText,
    placeholder
  } = rule.editorOptions || {}

  const inlineSerializer = new MarkdownSerializer({
    rules: subModules.reduce(
      (a, m) => a.concat(
        m.helpers && m.helpers.serializer &&
        m.helpers.serializer.rules
      ),
      []
    ).filter(Boolean).concat({
      matchMdast: (node) => node.type === 'break',
      fromMdast: (node, index, parent, visitChildren) => ({
        kind: 'text',
        leaves: [{text: '\n'}]
      })
    })
  })

  const Paragraph = rule.component

  const paragraph = {
    match: matchBlock(TYPE),
    matchMdast: rule.matchMdast || ((node) => node.type === 'paragraph'),
    fromMdast: (node, index, parent, visitChildren) => ({
      kind: 'block',
      type: TYPE,
      nodes: inlineSerializer.fromMdast(node.children)
    }),
    toMdast: (object, index, parent, visitChildren) => ({
      type: 'paragraph',
      children: inlineSerializer.toMdast(object.nodes)
    })
  }

  const serializer = new MarkdownSerializer({
    rules: [
      paragraph
    ]
  })

  return {
    TYPE,
    helpers: {
      serializer
    },
    changes: {},
    ui: {
      blockFormatButtons: [
        formatButtonText && createBlockButton({
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
              {formatButtonText}
            </span>
        )
      ]
    },
    plugins: [
      {
        onKeyDown (e, change) {
          const { value } = change
          if (e.key !== 'Enter') return
          if (e.shiftKey === false) return

          const { startBlock } = value
          const { type } = startBlock
          if (type !== TYPE) {
            return
          }

          return change.insertText('\n')
        },
        renderPlaceholder: placeholder && (({node}) => {
          if (!paragraph.match(node)) return
          if (node.text.length) return null

          return <Placeholder>{placeholder}</Placeholder>
        }),
        renderNode ({node, children, attributes}) {
          if (!paragraph.match(node)) return

          return (
            <Paragraph
              attributes={{...attributes, style: {position: 'relative'}}}
              data={node.data.toJS()}>
              {children}
            </Paragraph>
          )
        },
        schema: {
          blocks: {
            [TYPE]: {
              nodes: [
                {
                  kinds: ['text', 'inline']
                }
              ],
              normalize: (change, reason, {node, index, child}) => {
                if (reason === 'child_kind_invalid') {
                  change.unwrapBlockByKey(
                    child.key
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
