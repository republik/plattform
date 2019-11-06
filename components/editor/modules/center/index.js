import React from 'react'
import { matchBlock } from '../../utils'
import MarkdownSerializer from 'slate-mdast-serializer'

export default ({ rule, subModules, TYPE }) => {
  const paragraphModule = subModules.find(m => m.name === 'paragraph')
  if (!paragraphModule) {
    throw new Error('Missing paragraph submodule')
  }

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

  const center = {
    match: matchBlock(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: (node, index, parent, rest) => ({
      kind: 'block',
      type: TYPE,
      nodes: childSerializer.fromMdast(node.children, 0, node, rest)
    }),
    toMdast: (object, index, parent, rest) => ({
      type: 'zone',
      identifier: TYPE,
      children: childSerializer.toMdast(object.nodes, 0, object, rest)
    })
  }

  const serializer = new MarkdownSerializer({
    rules: [center]
  })

  const Center = rule.component

  return {
    TYPE,
    helpers: {
      serializer
    },
    changes: {},
    plugins: [
      {
        renderNode({ node, children, attributes }) {
          if (!center.match(node)) return

          return <Center attributes={attributes}>{children}</Center>
        },
        schema: {
          blocks: {
            [TYPE]: {
              nodes: [
                {
                  kinds: ['block'],
                  types: subModules.map(m => m.TYPE)
                }
              ],
              last: {
                types: [paragraphModule.TYPE]
              },
              normalize: (change, reason, { node, index, child }) => {
                if (reason === 'child_type_invalid') {
                  return change.setNodeByKey(child.key, {
                    type: paragraphModule.TYPE
                  })
                }
                if (reason === 'child_kind_invalid') {
                  return change.wrapBlockByKey(child.key, {
                    type: paragraphModule.TYPE
                  })
                }
                if (reason === 'last_child_type_invalid') {
                  if (child.kind === 'text') {
                    return change.wrapBlockByKey(child.key, {
                      kind: 'block',
                      type: paragraphModule.TYPE
                    })
                  }
                  return change.insertNodeByKey(node.key, node.nodes.size, {
                    kind: 'block',
                    type: paragraphModule.TYPE
                  })
                }
                throw reason
              }
            }
          }
        }
      }
    ]
  }
}
