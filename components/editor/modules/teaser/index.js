import React from 'react'
import MarkdownSerializer from 'slate-mdast-serializer'
import { matchBlock } from '../../utils'
import {
  createDropTarget,
  createMoveDragSource,
  getIndex,
  getParentKey,
  insert,
  move
} from './dnd'

const connectDnD = Component => createDropTarget(createMoveDragSource(
  props => {
    const { connectDragSource, connectDropTarget } = props
    return connectDropTarget(
      <div>
        {connectDragSource(<span>Dragme</span>)}
        <Component />
      </div>
    )
  }
))

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
    children: node.children.map(childSerializer.fromMdast)
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
    children: node.nodes.map(childSerializer.toMdast)
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
      if (!matchBlock(TYPE)) {
        return
      }

      const ConnectedDnD = connectDnD(() => (
        <Teaser data={node.data.getJS()} attributes={attributes}>
          {children}
        </Teaser>
      ))

      return (
        <ConnectedDnD
          getIndex={getIndex(editor)}
          getParentKey={getParentKey(editor)}
          move={move(editor)}
          insert={insert(editor)}
          />
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
  ]
})
