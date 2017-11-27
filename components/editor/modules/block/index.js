import React from 'react'
import MarkdownSerializer from 'slate-mdast-serializer'
import { Block } from 'slate'

import { matchBlock, createActionButton, buttonStyles } from '../../utils'
import injectBlock from '../../utils/injectBlock'

export default ({rule, subModules, TYPE}) => {
  const {
    insertButtonText,
    defaultProps
  } = rule.editorOptions || {}

  const childSerializer = new MarkdownSerializer({
    rules: subModules.reduce(
      (a, m) => a.concat(
        m.helpers && m.helpers.serializer &&
        m.helpers.serializer.rules
      ),
      []
    ).filter(Boolean)
  })

  const Container = rule.component

  const serializerRule = {
    match: matchBlock(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: (node, index, parent, rest) => {
      return {
        kind: 'block',
        type: TYPE,
        nodes: childSerializer.fromMdast(node.children, 0, node, rest)
      }
    },
    toMdast: (object, index, parent, rest) => {
      return {
        type: 'zone',
        identifier: TYPE,
        children: childSerializer.toMdast(object.nodes, 0, object, rest)
      }
    }
  }

  const serializer = new MarkdownSerializer({
    rules: [
      serializerRule
    ]
  })

  return {
    TYPE,
    helpers: {
      serializer
    },
    changes: {},
    ui: {
      insertButtons: [
        insertButtonText && createActionButton({
          isDisabled: ({ value }) => {
            return value.isBlurred
          },
          reducer: ({ value, onChange }) => event => {
            event.preventDefault()

            return onChange(
              value
                .change()
                .call(
                  injectBlock,
                  Block.create({
                    type: TYPE,
                    nodes: subModules.map(module => Block.create(module.TYPE))
                  })
                )
            )
          }
        })(
          ({ disabled, visible, ...props }) =>
            <span
              {...buttonStyles.insert}
              {...props}
              data-disabled={disabled}
              data-visible={visible}
              >
              {insertButtonText}
            </span>
        )
      ]
    },
    plugins: [
      {
        renderNode ({node, children, attributes}) {
          if (!serializerRule.match(node)) return
          return (
            <Container {...defaultProps} {...node.data.toJS()} attributes={attributes}>
              {children}
            </Container>
          )
        },
        onKeyDown (event, change) {
          const isBackspace = event.key === 'Backspace'
          if (event.key !== 'Enter' && !isBackspace) return

          const { value } = change
          const inBlock = value.document.getClosest(
            value.startBlock.key,
            serializerRule.match
          )
          if (!inBlock) return

          const isEmpty = !inBlock.text
          if (isEmpty && isBackspace) {
            event.preventDefault()
            return change
              .removeNodeByKey(inBlock.key)
          }
        },
        schema: {
          blocks: {
            [TYPE]: {
              nodes: subModules.map(module => ({
                types: [module.TYPE],
                kinds: ['block'],
                min: 1,
                max: 1
              })),
              normalize: (change, reason, {node, index, child}) => {
                if (reason === 'child_required') {
                  change.insertNodeByKey(
                    node.key,
                    index,
                    {
                      kind: 'block',
                      type: subModules[index].TYPE
                    }
                  )
                }
                if (reason === 'child_kind_invalid') {
                  change.wrapBlockByKey(
                    child.key,
                    {
                      type: subModules[index].TYPE
                    }
                  )
                }
                if (reason === 'child_type_invalid') {
                  change.setNodeByKey(
                    child.key,
                    {
                      type: subModules[index].TYPE
                    }
                  )
                }
                if (reason === 'child_unknown') {
                  if (index >= subModules.length) {
                    change.unwrapNodeByKey(child.key)
                  }
                }
              }
            }
          }
        }
      }
    ]
  }
}
