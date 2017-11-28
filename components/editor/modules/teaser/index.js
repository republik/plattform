// import React from 'react'

import MarkdownSerializer from 'slate-mdast-serializer'

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

export {
  fromMdast,
  toMdast
}
