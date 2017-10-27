import React from 'react'
import { Block } from 'slate'

import { matchBlock } from '../../utils'
import createUi from './ui'
import addValidation, { findOrCreate } from '../../utils/serializationValidation'

import MarkdownSerializer from '../../../../lib/serializer'

export default ({rule, subModules, TYPE}) => {
  const imageModule = subModules.find(m => m.identifier === 'FIGURE_IMAGE')
  if (!imageModule) {
    throw new Error('Missing FIGURE_IMAGE submodule')
  }
  const imageSerializer = imageModule.helpers.serializer
  const FIGURE_IMAGE = imageModule.TYPE

  const captionModule = subModules.find(m => m.identifier === 'FIGURE_CAPTION')
  if (!captionModule) {
    throw new Error('Missing FIGURE_CAPTION submodule')
  }
  const captionSerializer = captionModule.helpers.serializer
  const FIGURE_CAPTION = captionModule.TYPE

  const Figure = rule.component

  const figure = {
    match: matchBlock(TYPE),
    matchMdast: (node) => node.type === 'zone' && node.identifier === TYPE,
    fromMdast: (node, index, parent, visitChildren) => {
      const deepNodes = node.children.reduce(
        (children, child) => children
          .concat(child)
          .concat(child.children),
        []
      )
      const image = findOrCreate(deepNodes, {type: 'image'})
      const imageParent = node.children.find(n => n.children && n.children.indexOf(image) !== -1)

      const caption = {
        ...findOrCreate(
          node.children.filter(n => n !== imageParent),
          {type: 'paragraph'},
          {children: []}
        ),
        data: {
          captionRight: node.data.captionRight
        }
      }

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
    },
    render: ({ children, node, attributes }) => {
      return (
        <Figure data={node.data.toJS()} attributes={attributes}>
          {children}
        </Figure>
      )
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
  } = rule.options || {}

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
        onKeyDown (event, change) {
          const isBackspace = event.key === 'Backspace'
          if (event.key !== 'Enter' && !isBackspace) return

          const { state } = change
          const inFigure = state.document.getClosest(
            state.focusBlock.key,
            matchBlock(TYPE)
          )

          if (!inFigure) return

          event.preventDefault()

          if (isBackspace && state.focusBlock.type === FIGURE_IMAGE) {
            const isEmpty = !inFigure.text.trim()
            if (isEmpty) {
              return change
                .removeNodeByKey(inFigure.key)
            } else {
              return change.setNodeByKey(
                state.focusBlock.key,
                {
                  data: {}
                }
              )
            }
          }
          if (!isBackspace && state.endBlock.type === FIGURE_CAPTION) {
            const parent = state.document.getParent(inFigure.key)
            const node = Block.create(afterType)

            return change
              .insertNodeByKey(
                parent.key,
                parent.nodes.indexOf(inFigure) + 1,
                node
              )
              .collapseToEndOf(
                change.state.document.getNode(node.key)
              )
          }
        },
        schema: {
          rules: [
            figure
          ]
        }
      }
    ]
  }
}
