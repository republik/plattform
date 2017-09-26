import React from 'react'

const MissingMarkdownNodeType = ({node, children}) => (
  <span style={{background: '#FF5555', color: '#FFFFFF', display: 'inline-block', margin: 4}}>
    Missing Markdown node type "{node.type}"
    {node.identifier ? `with identifier "${node.identifier}"` : ''}
    {' '}
    {children}
  </span>
)

export const renderMdast = (mdast, schema = {}) => {
  const rules = schema.rules

  const visit = (node, index, parent) => {
    if (node.type === 'text') {
      return node.value
    }

    const rule = rules.find(r => r.matchMdast(node))
    if (!rule || !rule.component) {
      return (
        <MissingMarkdownNodeType key={index} node={node}>
          {visitChildren(node)}
        </MissingMarkdownNodeType>
      )
    }

    const Component = rule.component

    const data = rule.getData
      ? rule.getData(node, parent)
      : {}

    return (
      <Component key={index} data={data}>
        {rule.rules
          ? renderMdast(node.children, {
            rules: rule.rules
          })
          : visitChildren(node)}
      </Component>
    )
  }

  const visitArray = (array, parent) => {
    return array.map((item, index) => visit(item, index, parent))
  }

  const visitChildren = (node) => {
    if (!node.children || node.children.length === 0) {
      return null
    }
    return visitArray(node.children, node)
  }

  return Array.isArray(mdast)
    ? visitArray(mdast, null)
    : visit(mdast, 0, null)
}
