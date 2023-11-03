const DefaultMissingNode = ({ node, children }) => (
  <span
    style={{
      background: '#FF5555',
      color: '#FFFFFF',
      display: 'inline-block',
      margin: 4,
    }}
  >
    Missing Markdown node type &quot;{node.type}&quot;
    {node.identifier ? `with identifier "${node.identifier}"` : ''} {children}
  </span>
)

export const renderMdast = (mdast, schema, options = {}) => {
  const { ancestors = [], MissingNode = DefaultMissingNode } = options

  const rules = schema.rules.filter((rule) => rule.matchMdast && rule.component)

  const visit = (node, index, nodeAncestors) => {
    if (node.type === 'text') {
      return node.value
    }
    const parent = nodeAncestors[0]

    const rule = rules.find((r) => r.matchMdast(node, index, parent))
    if (!rule) {
      if (!MissingNode) {
        throw new Error(
          [
            `Missing Rule for Markdown node type "${node.type}"`,
            node.identifier ? `with identifier "${node.identifier}"` : '',
            'Note: A valid rules needs an renderMdast and component function',
          ].join(' '),
        )
      }
      return (
        <MissingNode
          key={index}
          node={node}
          index={index}
          parent={parent}
          ancestors={nodeAncestors}
        >
          {visitChildren(node, nodeAncestors)}
        </MissingNode>
      )
    }

    const Component = rule.component

    let props
    if (rule.props) {
      props = rule.props(node, index, parent, {
        ancestors: nodeAncestors,
      })
    } else {
      props = {
        data: node.data,
      }
    }

    let children = null
    if (rule.rules) {
      children = renderMdast(
        node.children,
        {
          rules: rule.rules,
        },
        {
          ...options,
          ancestors: [node].concat(nodeAncestors),
        },
      )
    } else if (!rule.isVoid) {
      children = visitChildren(node, nodeAncestors)
    }

    return (
      <Component key={index} {...props}>
        {children}
      </Component>
    )
  }

  const visitArray = (array, nodeAncestors) => {
    return array.map((item, index) => visit(item, index, nodeAncestors))
  }

  const visitChildren = (node, nodeAncestors) => {
    if (!node.children || node.children.length === 0) {
      return null
    }
    return visitArray(node.children, [node].concat(nodeAncestors))
  }

  return Array.isArray(mdast)
    ? visitArray(mdast, ancestors)
    : visit(mdast, 0, ancestors)
}
