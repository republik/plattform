import React from 'react'
import MarkdownSerializer from 'slate-mdast-serializer'

import { findNode } from '../../utils/serialization'
import { matchBlock } from '../../utils'
import createUi from './ui'

export default ({ rule, subModules, TYPE }) => {
  const editorOptions = rule.editorOptions || {}

  const { identifier = 'TITLE' } = editorOptions

  const childSerializer = new MarkdownSerializer({
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

  const Container = rule.component

  const serializerRule = {
    match: matchBlock(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: (node, index, parent, rest) => {
      const subject = findNode(node.children, { type: 'heading', depth: 2 })

      // if there's no subject yet, add one after the headline.
      const writableNode = { ...node, children: [...node.children] }
      if (!subject) {
        writableNode.children.splice(1, 0, {
          type: 'heading',
          depth: 2,
          children: []
        })
      }

      let nodes = childSerializer.fromMdast(
        writableNode.children,
        0,
        writableNode,
        rest
      )
      const { format } = rest.context
      if (format) {
        // enhance all immediate children with format
        // - needed for headline
        nodes = nodes.map(node => ({ ...node, data: { ...node.data, format } }))
      }

      return {
        kind: 'block',
        type: TYPE,
        data: {
          ...node.data,
          format
        },
        nodes
      }
    },
    toMdast: (object, index, parent, rest) => {
      // omit format
      const { format, ...data } = object.data
      return {
        type: 'zone',
        identifier,
        data,
        children: childSerializer.toMdast(object.nodes, 0, object, rest)
      }
    }
  }

  const serializer = new MarkdownSerializer({
    rules: [serializerRule]
  })

  return {
    TYPE,
    helpers: {
      serializer
    },
    changes: {},
    ui: createUi({
      TYPE,
      subModules,
      editorOptions
    }),
    plugins: [
      {
        renderNode({ node, children, attributes }) {
          if (!serializerRule.match(node)) return
          return (
            <Container {...node.data.toJS()} attributes={attributes}>
              {children}
            </Container>
          )
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
              normalize: (change, reason, { node, index, child }) => {
                if (reason === 'child_required') {
                  change.insertNodeByKey(node.key, index, {
                    kind: 'block',
                    type: subModules[index].TYPE
                  })
                }
                if (reason === 'child_kind_invalid') {
                  change.wrapBlockByKey(child.key, {
                    type: subModules[index].TYPE
                  })
                }
                if (reason === 'child_type_invalid') {
                  change.setNodeByKey(child.key, {
                    type: subModules[index].TYPE
                  })
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
