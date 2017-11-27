import React from 'react'

import MarkdownSerializer from 'slate-mdast-serializer'
import Placeholder from '../../Placeholder'
import { matchBlock, createBlockButton, buttonStyles } from '../../utils'

export default ({rule, subModules, TYPE}) => {
  const {
    depth,
    placeholder,
    formatButtonText
  } = rule.editorOptions || {}

  const title = {
    match: matchBlock(TYPE),
    matchMdast: (node) => node.type === 'heading' && node.depth === depth,
    fromMdast: (node, index, parent, {visitChildren}) => ({
      kind: 'block',
      type: TYPE,
      nodes: visitChildren(node)
    }),
    toMdast: (object, index, parent, {visitChildren}) => ({
      type: 'heading',
      depth,
      children: visitChildren(object)
    })
  }

  const serializer = new MarkdownSerializer({
    rules: [
      title
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
        renderPlaceholder: placeholder && (({node}) => {
          if (!title.match(node)) return
          if (node.text.length) return null

          return <Placeholder>{placeholder}</Placeholder>
        }),
        renderNode ({node, children, attributes}) {
          if (!title.match(node)) return
          return (
            <rule.component attributes={{...attributes, style: {position: 'relative'}}}>
              {children}
            </rule.component>
          )
        },
        schema: {
          blocks: {
            [TYPE]: {
              nodes: [
                { kinds: ['text'] }
              ]
            }
          }
        }
      }
    ]
  }
}
