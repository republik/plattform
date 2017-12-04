import MarkdownSerializer from 'slate-mdast-serializer'
import { Block } from 'slate'
import React from 'react'
import { matchBlock } from '../../utils'

import {
  getIndex,
  getParentKey,
  insert,
  move
} from '../teaser/dnd'

import { TeaserInlineUI } from '../teaser/ui'
import { TeaserGroupButton, TeaserGroupForm } from './ui'

export const getData = data => ({
  columns: 2,
  ...data || {}
})

export const getNewItem = options => () => {
  const [
    teaserModule
  ] = options.subModules

  const data = getData({
    teaserType: options.rule.editorOptions.teaserType
  })

  return Block.create({
    type: options.TYPE,
    data,
    nodes: [
      teaserModule.helpers.newItem(),
      teaserModule.helpers.newItem()
    ]
  })
}

export const fromMdast = ({
  TYPE,
  subModules
}) => (node,
  index,
  parent,
  {
    visitChildren,
    context
  }
) => {
  const [ teaserModule ] = subModules

  const teaserSerializer = teaserModule.helpers.serializer

  const data = getData(node.data)

  const result = {
    kind: 'block',
    type: TYPE,
    data,
    nodes: node.children.map(teaserSerializer.fromMdast)
  }
  return result
}

export const toMdast = ({
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

const teaserGroupPlugin = options => {
  const { TYPE, rule } = options
  const [
    teaserModule
  ] = options.subModules

  const TeaserGroup = rule.component

  return {
    renderNode ({ editor, node, attributes, children }) {
      if (!matchBlock(TYPE)(node)) {
        return
      }
      const UI = TeaserInlineUI(options)

      return ([
        <UI
          key='ui'
          nodeKey={node.key}
          getIndex={getIndex(editor)}
          getParentKey={getParentKey(editor)}
          move={move(editor)}
          insert={insert(editor)}
      />,
        <TeaserGroup key='teaser' {...node.data.toJS()} attributes={attributes}>
          {children}
        </TeaserGroup>
      ])
    },
    validateNode (node, ...args) {
      if (!matchBlock(TYPE)(node)) {
        return
      }
      const numNodes = node.nodes.size
      const wantedNodes = node.data.get('columns')
      if (numNodes === wantedNodes) {
        return
      }
      if (numNodes > wantedNodes) {
        const keyToRemove = node.nodes.last().key
        return change => change.removeNodeByKey(keyToRemove)
      } else {
        const keyToInsertAt = node.key
        return change => change.insertNodeByKey(keyToInsertAt, 1, teaserModule.helpers.newItem())
      }
    },
    schema: {
      blocks: {
        [TYPE]: {
          nodes: [
            {
              types: [teaserModule.TYPE],
              min: 1,
              max: 2
            }
          ]
        }
      }
    }
  }
}

export const getSerializer = options =>
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

export default options => ({
  helpers: {
    serializer: getSerializer(options),
    newItem: getNewItem(options)
  },
  plugins: [
    teaserGroupPlugin(options)
  ],
  ui: {
    insertButtons: [
      TeaserGroupButton(options)
    ],
    forms: [
      TeaserGroupForm(options)
    ]
  }
})
