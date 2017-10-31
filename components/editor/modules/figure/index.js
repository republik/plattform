import React from 'react'
import { Block } from 'slate'

import { matchBlock } from '../../utils'
import createUi from './ui'
import addValidation, { findOrCreate } from '../../utils/serializationValidation'

import MarkdownSerializer from '../../../../lib/serializer'

export default ({rule, subModules, TYPE}) => {
  // Define submodule and serializers
  const imageModule = subModules.find(m => m.name === 'figureImage')
  if (!imageModule) {
    throw new Error('Missing figureImage submodule')
  }
  const imageSerializer = imageModule.helpers.serializer

  const captionModule = subModules.find(m => m.name === 'paragraph')
  if (!captionModule) {
    throw new Error('Missing paragraph submodule')
  }
  const captionSerializer = captionModule.helpers.serializer

  const FIGURE_IMAGE = imageModule.TYPE
  const FIGURE_CAPTION = captionModule.TYPE

  const Figure = rule.component

  const figure = {
    match: matchBlock(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: (node, index, parent, visitChildren) => {
      const deepNodes = node.children.reduce(
        (children, child) => children
          .concat(child)
          .concat(child.children),
        []
      )
      const image = findOrCreate(deepNodes, {type: 'image'})
      const imageParagraph = node.children.find(n => n.children && n.children.indexOf(image) !== -1)

      const caption = (
        node.children.find(child => child.type === 'paragraph' && child !== imageParagraph) ||
        ({
          type: 'paragraph',
          children: []
        })
      )

      return {
        kind: 'block',
        type: TYPE,
        data: {
          float: node.data.float
        },
        nodes: [
          imageSerializer.fromMdast(image),
          captionSerializer.fromMdast(caption)
        ]
      }
    },
    toMdast: (object, index, parent, visitChildren, context) => {
      if (object.nodes.length !== 2) {
        context.dirty = true
      } else if (object.nodes[0].type !== FIGURE_IMAGE || object.nodes[1].type !== FIGURE_CAPTION) {
        context.dirty = true
      }

      const image = findOrCreate(object.nodes, {
        kind: 'block',
        type: FIGURE_IMAGE
      }, {isVoid: true, data: {}})
      const caption = findOrCreate(object.nodes, {
        kind: 'block',
        type: FIGURE_CAPTION
      }, {nodes: [], data: {}})

      return {
        type: 'zone',
        identifier: TYPE,
        data: {
          ...object.data,
          ...caption.data
        },
        children: [
          imageSerializer.toMdast(image),
          captionSerializer.toMdast(caption)
        ]
      }
    }
  }

  const serializer = new MarkdownSerializer({
    rules: [
      figure
    ]
  })

  const newBlock = () => Block.fromJSON(
    figure.fromMdast({
      children: [],
      data: {}
    })
  )

  addValidation(figure, serializer, TYPE)

  const {
    afterType
  } = rule.editorOptions || {}

  return {
    TYPE,
    helpers: {
      newBlock,
      serializer
    },
    changes: {},
    ui: createUi({TYPE, FIGURE_IMAGE, FIGURE_CAPTION, newBlock}),
    plugins: [
      {
        renderNode ({ children, node, attributes }) {
          if (node.type !== TYPE) return
          return (
            <Figure data={node.data.toJS()} attributes={attributes}>
              {children}
            </Figure>
          )
        },

        onKeyDown (event, change) {
          const isBackspace = event.key === 'Backspace'
          if (event.key !== 'Enter' && !isBackspace) return

          const { value } = change
          const inFigure = value.document.getClosest(
            value.focusBlock.key,
            matchBlock(TYPE)
          )

          if (!inFigure) return

          event.preventDefault()

          if (isBackspace && value.focusBlock.type === FIGURE_IMAGE) {
            const isEmpty = !inFigure.text.trim()
            if (isEmpty) {
              return change
                .removeNodeByKey(inFigure.key)
            } else {
              return change.setNodeByKey(
                value.focusBlock.key,
                {
                  data: {}
                }
              )
            }
          }
          if (!isBackspace && value.endBlock.type === FIGURE_CAPTION) {
            const parent = value.document.getParent(inFigure.key)
            const node = Block.create(afterType)

            return change
              .insertNodeByKey(
                parent.key,
                parent.nodes.indexOf(inFigure) + 1,
                node
              )
              .collapseToEndOf(
                change.value.document.getNode(node.key)
              )
          }
        },
        schema: {
          blocks: {
            [TYPE]: {
              nodes: [
                {
                  types: [imageModule.TYPE],
                  min: 1,
                  max: 1
                },
                {
                  types: [captionModule.TYPE],
                  min: 1,
                  max: 1
                }
              ]
            },
            normalize (change, reason, {node, index, child}) {
              if (reason === 'child_required') {
                change.insertNodeByKey(
                  node.key,
                  index,
                  {
                    kind: 'block',
                    type: index === 0
                      ? imageModule.TYPE
                      : captionModule.TYPE,
                    isVoid: index === 0
                  }
                )
              }
              if (reason === 'child_type_invalid') {
                change.setNodeByKey(
                  child.key,
                  {
                    type: index === 0
                      ? imageModule.TYPE
                      : captionModule.TYPE
                  }
                )
              }
              if (reason === 'child_unknown') {
                if (index > 1) {
                  change.mergeNodeByKey(child.key)
                }
              }
            }
          }
        }
      }
    ]
  }
}
