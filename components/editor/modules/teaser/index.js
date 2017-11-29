import React from 'react'
import { matchBlock } from '../../utils'
import { Block, Text } from 'slate'

import getSerializer from './serializer'

import {
  getIndex,
  getParentKey,
  insert,
  move
} from './dnd'

import { TeaserButton, TeaserInlineUI } from './ui'

const getNewItem = () => Block.create({
  type: 'TEASER',
  nodes: [
    Block.create({
      type: 'paragraph',
      nodes: [
        Text.create('New teaser')
      ]
    })
  ]
})

const teaserPlugin = ({ TYPE, rule }) => {
  const Teaser = rule.component
  return {
    renderNode ({ editor, node, attributes, children }) {
      if (!matchBlock(TYPE)(node)) {
        return
      }

      return (
        <TeaserInlineUI
          nodeKey={node.key}
          getIndex={getIndex(editor)}
          getParentKey={getParentKey(editor)}
          move={move(editor)}
          insert={insert(editor)}
        >
          <Teaser {...node.data.toJS()} attributes={attributes}>
            {children}
          </Teaser>
        </TeaserInlineUI>
      )
    }
  }
}

export default options => ({
  helpers: {
    serializer: getSerializer(options)
  },
  plugins: [
    teaserPlugin(options)
  ],
  ui: {
    insertButtons: [() => <TeaserButton getNewItem={getNewItem} />]
  }
})
