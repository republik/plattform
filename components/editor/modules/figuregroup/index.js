import MarkdownSerializer from 'slate-mdast-serializer'
import { Block } from 'slate'
import React from 'react'
import { FigureGroupButton, FigureGroupForm } from './ui'
import { matchBlock } from '../../utils'
import { createRemoveEmptyKeyHandler } from '../../utils/keyHandlers'
import GalleryIcon from 'react-icons/lib/md/filter'

export const getData = data => ({
  columns: 2,
  module: 'figuregroup',
  ...(data || {})
})

export const getNewBlock = options => () => {
  const [figureModule, captionModule] = options.subModules

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

export const fromMdast = ({ TYPE, subModules }) => (
  node,
  index,
  parent,
  { visitChildren, context }
) => {
  const [figureModule, captionModule] = subModules

  const figureSerializer = figureModule.helpers.serializer

  const data = getData(node.data)

  const caption = node.children[node.children.length - 1]
  const hasCaption = caption.type === 'paragraph'
  const figures = (hasCaption ? node.children.slice(0, -1) : node.children).map(
    v => figureSerializer.fromMdast(v)
  )
  const nodes = hasCaption
    ? figures.concat(captionModule.helpers.serializer.fromMdast(caption))
    : figures

  const result = {
    kind: 'block',
    type: TYPE,
    data,
    nodes
  }
  return result
}

export const toMdast = ({ TYPE, subModules }) => (
  node,
  index,
  parent,
  { visitChildren, context }
) => {
  const [figureModule, captionModule] = subModules

  const mdastChildren = node.nodes
    .slice(0, -1)
    .map(v => figureModule.helpers.serializer.toMdast(v))
    .concat(
      captionModule.helpers.serializer.toMdast(
        node.nodes[node.nodes.length - 1]
      )
    )

  return {
    type: 'zone',
    identifier: 'FIGUREGROUP',
    children: mdastChildren,
    data: node.data
  }
}

const isEmpty = options => {
  const [figureModule] = options.subModules
  return node => {
    const figures = node.nodes.skipLast(1)
    return (
      figures.every(figureModule.helpers.isEmpty) &&
      figures.size < 3 &&
      !node.nodes.last().text
    )
  }
}

const figureGroupPlugin = options => {
  const { TYPE, rule } = options
  const [figureModule, captionModule] = options.subModules

  const FigureGroup = rule.component
  return {
    renderNode({ editor, node, attributes, children }) {
      if (!matchBlock(TYPE)(node)) {
        return
      }

      return (
        <FigureGroup
          size='breakout'
          {...node.data.toJS()}
          slideshow={false}
          attributes={attributes}
        >
          {node.data.get('slideshow') > 0 && (
            <div style={{ position: 'absolute', left: -25 }}>
              <GalleryIcon />
            </div>
          )}
          {children}
        </FigureGroup>
      )
    },
    onKeyDown: createRemoveEmptyKeyHandler({ TYPE, isEmpty: isEmpty(options) }),
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
          normalize(change, reason, { index, node, child }) {
            const insertCaption = () =>
              change.insertNodeByKey(
                node.key,
                index,
                Block.create({
                  type: captionModule.TYPE
                })
              )
            const insertFigure = () =>
              change.insertNodeByKey(
                node.key,
                index,
                figureModule.helpers.newBlock()
              )
            switch (reason) {
              case 'last_child_type_invalid':
                return insertCaption()
              case 'child_type_invalid':
                if (child.type === captionModule.TYPE) {
                  return insertFigure()
                }
                break
              case 'child_required':
                if (index === node.nodes.size) {
                  return insertCaption()
                } else {
                  return insertFigure()
                }
              case 'child_unknown':
                // use default delete node behaviour
                return
            }
            throw reason
          }
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
        matchMdast: options.rule.matchMdast,
        fromMdast: fromMdast(options),
        toMdast: toMdast(options)
      }
    ]
  })

export default options => ({
  helpers: {
    serializer: getSerializer(options),
    newBlock: getNewBlock(options),
    isEmpty: isEmpty(options)
  },
  plugins: [figureGroupPlugin(options)],
  ui: {
    insertButtons: [FigureGroupButton(options)],
    forms: [FigureGroupForm(options)]
  }
})
