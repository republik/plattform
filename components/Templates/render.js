import React from 'react'

export const MissingMarkdownNodeType = ({node, children}) => (
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
      : (node.data || {})

    let children = null
    if (rule.rules) {
      children = renderMdast(
        node.children, {
          rules: rule.rules
        }
      )
    } else if (!rule.isVoid) {
      children = visitChildren(node)
    }

    return (
      <Component key={index} data={data}>
        {children}
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
