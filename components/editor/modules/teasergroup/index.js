import MarkdownSerializer from 'slate-mdast-serializer'
import { Block } from 'slate'
import React from 'react'
import { matchBlock } from '../../utils'

import {
  getIndex,
  getParent,
  insert,
  moveUp,
  moveDown,
  remove
} from '../teaser/actions'

import { TeaserInlineUI } from '../teaser/ui'
import { TeaserGroupButton, TeaserGroupForm } from './ui'

export const getData = data => ({
  columns: 2,
  module: 'teaser',
  ...data || {}
})

export const getNewBlock = options => () => {
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
      teaserModule.helpers.newBlock(),
      teaserModule.helpers.newBlock()
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
    nodes: node.children.map(
      v => teaserSerializer.fromMdast(v)
    )
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
  const [ teaserModule ] = subModules

  const mdastChildren = node.nodes.map(v =>
    teaserModule.helpers.serializer.toMdast(v)
  )

  return {
    type: 'zone',
    identifier: 'TEASERGROUP',
    children: mdastChildren,
    data: node.data
  }
}

const teaserGroupPlugin = options => {
  const { TYPE, rule } = options

  const TeaserGroup = rule.component

  const [ teaserModule ] = options.subModules

  return {
    renderNode ({ editor, node, attributes, children }) {
      if (!matchBlock(TYPE)(node)) {
        return
      }
      const UI = TeaserInlineUI(options)

      const teaser = editor.value.blocks.reduce(
        (memo, node) =>
          memo || editor.value.document.getFurthest(node.key, matchBlock(TYPE)),
        undefined
      )

      const isSelected = teaser === node && !editor.value.isBlurred

      return ([
        <UI
          key='ui'
          isSelected={isSelected}
          nodeKey={node.key}
          getIndex={getIndex(editor)}
          getParent={getParent(editor)}
          moveUp={moveUp(editor)}
          moveDown={moveDown(editor)}
          insert={insert(editor)}
          remove={remove(editor)}
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
        return change => change.insertNodeByKey(keyToInsertAt, 1, teaserModule.helpers.newBlock())
      }
    },
    schema: {
      blocks: {
        [TYPE]: {
          nodes: [
            {
              blocks: options.subModules.map(m => m.TYPE)
            }
          ]
        }
      }
    }
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

export default options => ({
  helpers: {
    serializer: getSerializer(options),
    newBlock: getNewBlock(options)
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
