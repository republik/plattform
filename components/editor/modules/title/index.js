import React from 'react'
import MarkdownSerializer from 'slate-mdast-serializer'

import { matchBlock } from '../../utils'
import createUi from './ui'

export default ({rule, subModules, TYPE}) => {
  const editorOptions = rule.editorOptions || {}

  const {
    identifier = 'TITEL'
  } = editorOptions

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
        identifier,
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
    ui: createUi({
      TYPE,
      subModules,
      editorOptions
    }),
    plugins: [
      {
        renderNode ({node, children, attributes}) {
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
