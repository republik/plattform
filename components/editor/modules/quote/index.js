import React from 'react'
import MarkdownSerializer from 'slate-mdast-serializer'

import { matchBlock } from '../../utils'
import createUi from './ui'

export default ({ rule, subModules, TYPE }) => {
  const editorOptions = rule.editorOptions || {}

  const paragrapQuoteModule = subModules.find(m => m.name === 'paragraph')
  if (!paragrapQuoteModule) {
    throw new Error('Missing paragraph submodule (quote)')
  }
  const paragraphSourceModule = subModules.find(
    m => m.name === 'paragraph' && m !== paragrapQuoteModule
  )
  if (!paragraphSourceModule) {
    throw new Error('Missing a second paragraph submodule (source)')
  }

  const figureModule = subModules.find(m => m.name === 'figure')

  const orderedSubModules = [
    figureModule,
    paragrapQuoteModule,
    paragraphSourceModule
  ].filter(Boolean)

  const childSerializer = new MarkdownSerializer({
    rules: orderedSubModules
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
      return {
        kind: 'block',
        type: TYPE,
        data: node.data,
        nodes: childSerializer.fromMdast(node.children, 0, node, rest)
      }
    },
    toMdast: (object, index, parent, rest) => {
      return {
        type: 'zone',
        identifier: TYPE,
        data: object.data,
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
      subModules: orderedSubModules,
      editorOptions,
      paragrapQuoteModule,
      paragraphSourceModule,
      figureModule
    }),
    plugins: [
      {
        renderNode({ node, children, attributes }) {
          if (!serializerRule.match(node)) return

          const hasFigure =
            figureModule && !!node.nodes.find(n => n.type === figureModule.TYPE)
          return (
            <Container
              {...node.data.toJS()}
              hasFigure={hasFigure}
              attributes={attributes}
            >
              {children}
            </Container>
          )
        },
        onKeyDown(event, change) {
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
            return change.removeNodeByKey(inBlock.key)
          }
        },
        schema: {
          blocks: {
            [TYPE]: {
              nodes: [
                figureModule && {
                  kinds: ['block'],
                  types: [figureModule.TYPE],
                  min: 0,
                  max: 1
                },
                {
                  kinds: ['block'],
                  types: [paragrapQuoteModule.TYPE],
                  min: 1,
                  max: 1
                },
                {
                  kinds: ['block'],
                  types: [paragraphSourceModule.TYPE],
                  min: 1,
                  max: 1
                }
              ].filter(Boolean),
              normalize: (change, reason, { node, index, child }) => {
                let orderedTypes = orderedSubModules.map(
                  subModule => subModule.TYPE
                )
                if (figureModule) {
                  const hasFigure = !!node.nodes.find(
                    n => n.type === figureModule.TYPE
                  )
                  if (!hasFigure) {
                    orderedTypes = orderedTypes.filter(
                      type => type !== figureModule.TYPE
                    )
                  }
                }

                if (node.nodes.first().kind !== 'block') {
                  child = node.nodes.first()
                  reason = 'child_kind_invalid'
                  index = 0
                }

                if (reason === 'child_required') {
                  change.insertNodeByKey(node.key, index, {
                    kind: 'block',
                    type: orderedTypes[index]
                  })
                }
                if (reason === 'child_kind_invalid') {
                  change.wrapBlockByKey(child.key, {
                    type: orderedTypes[index]
                  })
                }
                if (reason === 'child_type_invalid') {
                  change.setNodeByKey(child.key, {
                    type: orderedTypes[index]
                  })
                }
                if (reason === 'child_unknown') {
                  if (index >= orderedTypes.length) {
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
