import React from 'react'
import { matchBlock } from '../../utils'
import { UL, LI } from './constants'
import { ULButton } from './ui'
import { serializer as paragraphSerializer, PARAGRAPH } from '../paragraph'
import MarkdownSerializer from '../../../../lib/serializer'
import addValidation from '../../utils/serializationValidation'

const listItem = {
  match: matchBlock(LI),
  matchMdast: (node) => node.type === 'listItem',
  fromMdast: (node, index, parent, visitChildren) => ({
    kind: 'block',
    type: LI,
    nodes: paragraphSerializer.fromMdast(node.children)
  }),
  toMdast: (object, index, parent, visitChildren) => ({
    type: 'listItem',
    children: paragraphSerializer.toMdast(object.nodes)
  }),
  render: ({ children, node }) => (
    <li>{ children }</li>
  )
}

const itemSerializer = new MarkdownSerializer({
  rules: [
    listItem
  ]
})

const ul = {
  match: matchBlock(UL),
  matchMdast: (node) => node.type === 'list' && !node.ordered,
  fromMdast: (node, index, parent, visitChildren) => ({
    kind: 'block',
    type: UL,
    nodes: itemSerializer.fromMdast(node.children)
  }),
  toMdast: (object, index, parent, visitChildren, context) => ({
    type: 'list',
    ordered: false,
    children: itemSerializer.toMdast(object.nodes, context)
  }),
  render: ({ children, node }) => (
    <ul>{ children }</ul>
  )
}

export const serializer = new MarkdownSerializer({
  rules: [
    ul
  ]
})

addValidation(ul, serializer, 'ul')

export {
  UL,
  ULButton
}

export default {
  plugins: [
    {
      onKeyDown (event, data, state) {
        const isBackspace = data.key === 'backspace'
        if (data.key !== 'enter' && !isBackspace) return

        const inList = state.document.getClosest(state.startBlock.key, matchBlock(UL))
        if (!inList) return

        event.preventDefault()

        const inItem = state.document.getClosest(state.startBlock.key, matchBlock(LI))
        const isEmpty = !inItem || !inItem.text

        if (isEmpty && (!isBackspace || inList.nodes.size === 1)) {
          return state.transform()
            .unwrapBlock()
            .apply()
        }

        if (isBackspace) {
          const t = state.transform().deleteBackward()
          if (isEmpty) {
            t.removeNodeByKey(inItem.key)
          }
          return t.apply()
        }

        return state.transform()
          .splitBlock(2)
          .apply()
      },
      schema: {
        rules: [
          {
            match: matchBlock(UL),
            validate: node => {
              const notItems = node.nodes
                .filter(n => n.type !== LI)

              return notItems.size
                ? notItems
                : null
            },
            normalize: (transform, object, notItems) => {
              notItems.forEach(child => {
                if (child.kind === 'block') {
                  transform.unwrapNodeByKey(child.key)
                } else {
                  transform.wrapBlockByKey(child.key, LI)
                }
              })

              return transform
            }
          },
          {
            match: matchBlock(LI),
            validate: node => {
              const notParagraphs = node.nodes
                .filter(n => n.type !== PARAGRAPH)

              return notParagraphs.size
                ? notParagraphs
                : null
            },
            normalize: (transform, object, notParagraphs) => {
              notParagraphs.forEach(child => {
                if (child.kind === 'block') {
                  transform.unwrapNodeByKey(child.key)
                } else {
                  transform.wrapBlockByKey(child.key, PARAGRAPH)
                }
              })

              return transform
            }
          },
          ul,
          listItem
        ]
      }
    }
  ]
}
