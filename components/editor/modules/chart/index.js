import React from 'react'
import MarkdownSerializer from 'slate-mdast-serializer'
import { Block } from 'slate'

import createUi, { EditButton, EditModal } from './ui'
import { matchBlock } from '../../utils'
import { createRemoveEmptyKeyHandler } from '../../utils/keyHandlers'

export default ({rule, subModules, TYPE}) => {
  const canvasModule = subModules.find(m => m.name === 'chartCanvas')
  if (!canvasModule) {
    throw new Error('Missing chartCanvas submodule')
  }

  const CANVAS_TYPE = canvasModule.TYPE

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
    rules: [
      serializerRule
    ]
  })

  const newBlock = () => Block.create({
    type: TYPE,
    data: {
      isEditing: true
    },
    nodes: subModules.map(m => Block.create({
      type: m.TYPE
    }))
  })

  const isEmpty = node => (
    !node.text.trim()
  )

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
        renderNode ({ editor, node, children, attributes }) {
          if (!serializerRule.match(node)) return

          const canvas = node.nodes.find(
            matchBlock(CANVAS_TYPE)
          )

          const startEditing = () => {
            editor.change(change => {
              change.setNodeByKey(node.key, {
                data: node.data.set('isEditing', true)
              })
            })
          }

          return (
            <Container
              size={canvas.data.get('size')}
              attributes={{
                ...attributes,
                onDoubleClick: startEditing
              }}>
              <EditButton onClick={startEditing} />
              {!!node.data.get('isEditing') && (
                <EditModal data={canvas.data}
                  onChange={(data) => {
                    editor.change(change => {
                      change.setNodeByKey(canvas.key, {
                        data: node.data.merge(data)
                      })
                    })
                  }}
                  onClose={() => {
                    editor.change(change => {
                      change.setNodeByKey(node.key, {
                        data: node.data.delete('isEditing')
                      })
                    })
                  }} />
              )}
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
