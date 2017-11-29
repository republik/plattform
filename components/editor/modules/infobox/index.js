import React from 'react'
import MarkdownSerializer from 'slate-mdast-serializer'

import { matchBlock } from '../../utils'
import createUi from './ui'

export default ({rule, subModules, TYPE}) => {
  const editorOptions = rule.editorOptions || {}

  const titleModule = subModules.find(m => m.name === 'headline')
  if (!titleModule) {
    throw new Error('Missing headline submodule')
  }

  const paragraphModule = subModules.find(m => m.name === 'paragraph')
  if (!paragraphModule) {
    throw new Error('Missing paragraph submodule')
  }

  const figureModule = subModules.find(m => m.name === 'figure')

  const orderedSubModules = [
    titleModule,
    figureModule,
    paragraphModule
  ].filter(Boolean)

  const childSerializer = new MarkdownSerializer({
    rules: orderedSubModules.reduce(
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
    ui: createUi({
      TYPE,
      subModules: orderedSubModules,
      editorOptions,
      figureModule
    }),
    plugins: [
      {
        renderNode ({node, children, attributes}) {
          if (!serializerRule.match(node)) return

          const hasFigure = figureModule && node.nodes.find(n => n.type === figureModule.TYPE)
          return (
            <Container
              {...node.data.toJS()}
              figureSize={hasFigure ? node.data.get('figureSize', 'S') : undefined}
              attributes={attributes}>
              {children}
            </Container>
          )
        },
        onKeyDown (event, change) {
          const isBackspace = event.key === 'Backspace'
          if (event.key !== 'Enter' && !isBackspace) return

          const { value } = change
          const inBox = value.document.getClosest(value.startBlock.key, matchBlock(TYPE))
          if (!inBox) return

          const isEmpty = !inBox || !inBox.text

          // unwrap empty paragraph on enter
          const block = value.startBlock
          if (!block.text && !isBackspace) {
            event.preventDefault()
            return change
              .unwrapBlock(TYPE)
              .unwrapBlock(paragraphModule.TYPE)
          }

          // rm info box if empty on backspace
          if (isBackspace) {
            event.preventDefault()
            const t = change.deleteBackward()
            if (isEmpty) {
              t.removeNodeByKey(inBox.key)
            }
            return t
          }
        },
        schema: {
          blocks: {
            [TYPE]: {
              nodes: [
                {
                  types: [titleModule.TYPE], min: 1, max: 1
                },
                figureModule && {
                  types: [figureModule.TYPE], min: 0, max: 1
                },
                {
                  types: [paragraphModule.TYPE], min: 1
                }
              ].filter(Boolean),
              normalize: (change, reason, {node, index, child}) => {
                if (reason === 'child_required') {
                  change.insertNodeByKey(
                    node.key,
                    index,
                    {
                      kind: 'block',
                      type: orderedSubModules[index].TYPE
                    }
                  )
                }
                if (reason === 'child_kind_invalid') {
                  change.wrapBlockByKey(
                    child.key,
                    {
                      type: orderedSubModules[index].TYPE
                    }
                  )
                }
                if (reason === 'child_type_invalid') {
                  change.setNodeByKey(
                    child.key,
                    {
                      type: orderedSubModules[index].TYPE
                    }
                  )
                }
                if (reason === 'child_unknown') {
                  const hasFigure = figureModule && !!node.nodes.find(n => n.type === figureModule.TYPE)
                  if (index >= orderedSubModules.length - (figureModule && !hasFigure ? 1 : 0)) {
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
