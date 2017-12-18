import MarkdownSerializer from 'slate-mdast-serializer'
import { Block } from 'slate'
import React from 'react'
import { FigureGroupButton, FigureGroupForm } from './ui'
import { matchBlock } from '../../utils'

export const getData = data => ({
  columns: 2,
  ...data || {}
})

export const getNewItem = options => () => {
  const [
    figureModule,
    captionModule
  ] = options.subModules

  return Block.create({
    type: options.TYPE,
    data: getData(),
    nodes: [
      figureModule.helpers.newBlock(),
      figureModule.helpers.newBlock(),
      Block.create({ type: captionModule.TYPE })
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
  const [ figureModule ] = subModules

  const figureSerializer = figureModule.helpers.serializer

  const data = getData(node.data)

  const result = {
    kind: 'block',
    type: TYPE,
    data,
    nodes: node.children.map(
      v => figureSerializer.fromMdast(v)
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
  const [ figureModule ] = subModules

  const mdastChildren = node.nodes.map(v =>
    figureModule.helpers.serializer.toMdast(v)
  )

  return {
    type: 'zone',
    identifier: 'FIGUREGROUP',
    children: mdastChildren,
    data: node.data
  }
}

const figureGroupPlugin = options => {
  const { TYPE, rule } = options
  const [
    figureModule,
    captionModule
  ] = options.subModules

  const FigureGroup = rule.component
  return {
    renderNode ({ editor, node, attributes, children }) {
      if (!matchBlock(TYPE)(node)) {
        return
      }

      return (
        <FigureGroup key='teaser' {...node.data.toJS()} attributes={attributes}>
          {children}
        </FigureGroup>
      )
    },
    schema: {
      blocks: {
        [TYPE]: {
          nodes: [
            {
              types: [figureModule.TYPE],
              min: 2
            },
            {
              types: [captionModule.TYPE],
              min: 1,
              max: 1
            }
          ],
          last: {
            types: [captionModule.TYPE]
          },
          normalize (change, reason, { index, node, child }) {
            switch (reason) {
              case 'last_child_type_invalid':
                return change.insertNodeByKey(
                  node.key,
                  index,
                  Block.create({
                    type: captionModule.TYPE
                  })
                )
              case 'child_type_invalid':
                if (child.type === captionModule.TYPE) {
                  return change.insertNodeByKey(
                    node.key,
                    index,
                    figureModule.helpers.newBlock()
                  )
                }
            }

            throw reason
          }
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
    figureGroupPlugin(options)
  ],
  ui: {
    insertButtons: [
      FigureGroupButton(options)
    ],
    forms: [
      FigureGroupForm(options)
    ]
  }
})
