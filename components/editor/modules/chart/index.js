import React from 'react'
import MarkdownSerializer from 'slate-mdast-serializer'
import { Block } from 'slate'

import createUi from './ui'
import { matchBlock } from '../../utils'
import { createRemoveEmptyKeyHandler } from '../../utils/keyHandlers'

export default ({ rule, subModules, TYPE }) => {
  const canvasModule = subModules.find(m => m.name === 'chartCanvas')
  if (!canvasModule) {
    throw new Error('Missing chartCanvas submodule')
  }

  const CANVAS_TYPE = canvasModule.TYPE

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
      return {
        kind: 'block',
        type: TYPE,
        data: node.data,
        nodes: childSerializer.fromMdast(node.children, 0, node, rest)
      }
    },
    toMdast: (object, index, parent, rest) => {
      const canvas = object.nodes.find(matchBlock(CANVAS_TYPE))

      return {
        type: 'zone',
        identifier: 'CHART',
        data: canvas.data.config,
        children: childSerializer.toMdast(object.nodes, 0, object, rest)
      }
    }
  }
  const serializer = new MarkdownSerializer({
    rules: [serializerRule]
  })

  const random = () => Math.round(Math.random() * 10) / 10
  const newBlock = () =>
    Block.create({
      type: TYPE,
      nodes: subModules.map(m =>
        Block.create({
          type: m.TYPE,
          data:
            m.TYPE === CANVAS_TYPE
              ? {
                  isNew: true,
                  config: { type: 'Bar', y: 'label' },
                  values: `label,value\nA,${random()}\nB,${random()}`
                }
              : undefined
        })
      )
    })

  const isEmpty = node => !node.text.trim()

  return {
    TYPE,
    helpers: {
      serializer,
      newBlock
    },
    ui: createUi({
      TYPE,
      CANVAS_TYPE,
      newBlock,
      editorOptions: rule.editorOptions
    }),
    plugins: [
      {
        renderNode({ editor, node, children, attributes }) {
          if (!serializerRule.match(node)) return
          return (
            <Container size={node.data.get('size')} attributes={attributes}>
              {children}
            </Container>
          )
        },
        onKeyDown: createRemoveEmptyKeyHandler({ TYPE, isEmpty }),
        schema: {
          blocks: {
            [TYPE]: {
              nodes: subModules.map(m => ({
                kinds: ['block'],
                types: [m.TYPE],
                min: 1,
                max: 1
              })),
              normalize: (change, reason, { node, index, child }) => {
                if (
                  reason === 'child_required' ||
                  (reason === 'child_type_invalid' &&
                    subModules.find(m => m.TYPE === child.type) &&
                    node.nodes.filter(matchBlock(child.type)).size === 1)
                ) {
                  change.insertNodeByKey(node.key, index, {
                    kind: 'block',
                    type: subModules[index].TYPE
                  })
                }
                if (reason === 'child_unknown') {
                  change.unwrapNodeByKey(child.key)
                }
              }
            }
          }
        }
      }
    ]
  }
}
