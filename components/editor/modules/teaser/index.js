import React from 'react'
import MarkdownSerializer from 'slate-mdast-serializer'
import { Block, Text } from 'slate'
import { matchBlock } from '../../utils'
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

const fromMdast = ({
  TYPE,
  subModules
}) => (
  node,
  index,
  parent,
  {
    visitChildren,
    context
  }
) => {
  const childSerializer = new MarkdownSerializer({
    rules: subModules.reduce(
      (a, m) => a.concat(
        m.helpers && m.helpers.serializer &&
        m.helpers.serializer.rules
      ),
      []
    ).filter(Boolean)
  })

  return {
    kind: 'block',
    type: TYPE,
    nodes: childSerializer.fromMdast(node.children)
  }
}

const toMdast = ({
  TYPE,
  subModules
}) => (
  node,
  index,
  parent,
  {
    visitChildren,
    context
  }
) => {
  const childSerializer = new MarkdownSerializer({
    rules: subModules.reduce(
      (a, m) => a.concat(
        m.helpers && m.helpers.serializer &&
        m.helpers.serializer.rules
      ),
      []
    ).filter(Boolean).concat({
      matchMdast: (node) => node.type === 'break',
      fromMdast: () => ({
        kind: 'text',
        leaves: [{text: '\n'}]
      })
    })
  })
  return {
    type: 'zone',
    identifier: 'TEASER',
    children: childSerializer.toMdast(node.nodes)
  }
}

const getSerializer = options =>
  new MarkdownSerializer({
    rules: [
      {
        match: matchBlock(options.TYPE),
        matchMdast:
          options.rule.matchMdast,
        fromMdast: fromMdast(options),
        toMdast: toMdast(options)
      }
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
          <Teaser data={node.data.toJS()} attributes={attributes}>
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
