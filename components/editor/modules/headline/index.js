import React from 'react'

import MarkdownSerializer from 'slate-mdast-serializer'
import Placeholder from '../../Placeholder'
import { matchBlock, createBlockButton, buttonStyles } from '../../utils'
import {
  createStaticKeyHandler,
  createInsertAfterKeyHandler
} from '../../utils/keyHandlers'

export default ({ rule, subModules, TYPE }) => {
  const {
    depth,
    placeholder,
    formatButtonText,
    formatTypes,
    isStatic = false
  } = rule.editorOptions || {}

  const inlineSerializer = new MarkdownSerializer({
    rules: subModules
      .reduce(
        (a, m) =>
          a.concat(
            m.helpers && m.helpers.serializer && m.helpers.serializer.rules
          ),
        []
      )
      .filter(Boolean)
  })

  const title = {
    match: matchBlock(TYPE),
    matchMdast: node => node.type === 'heading' && node.depth === depth,
    fromMdast: (node, index, parent, rest) => {
      return {
        kind: 'block',
        type: TYPE,
        nodes: inlineSerializer.fromMdast(node.children, 0, node, rest)
      }
    },
    toMdast: (object, index, parent, rest) => {
      return {
        type: 'heading',
        depth,
        children: inlineSerializer.toMdast(object.nodes, 0, object, rest)
      }
    }
  }

  const serializer = new MarkdownSerializer({
    rules: [title]
  })

  return {
    TYPE,
    helpers: {
      serializer
    },
    changes: {},
    rule: title,
    ui: {
      blockFormatButtons: [
        formatButtonText &&
          createBlockButton({
            type: TYPE,
            parentTypes: formatTypes
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
        onKeyDown: isStatic
          ? createStaticKeyHandler({ TYPE, rule })
          : createInsertAfterKeyHandler({ TYPE, rule }),
        renderPlaceholder:
          placeholder &&
          (({ node }) => {
            if (!title.match(node)) return
            if (node.text.length) return null

            return <Placeholder>{placeholder}</Placeholder>
          }),
        renderNode({ node, children, attributes }) {
          if (!title.match(node)) return

          return (
            <rule.component
              attributes={{
                ...attributes,
                style: { position: 'relative' }
              }}
              {...node.data.toJS()}
            >
              <span
                style={{
                  position: 'relative',
                  display: 'block'
                }}
              >
                {children}
              </span>
            </rule.component>
          )
        },
        schema: {
          blocks: {
            [TYPE]: {
              nodes: [{ kinds: ['text'] }]
            }
          }
        }
      }
    ]
  }
}
