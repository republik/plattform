export const findOrCreate = (nodes, targetNode, newProps) => {
  const node = findNode(nodes, targetNode)
  return node || {
    ...targetNode,
    ...newProps
  }
}

export const findNode = (nodes, targetNode) => {
  const match = node => Object.keys(targetNode)
    .every(key => node[key] === targetNode[key])
  const node = nodes.find(match)
  return node
}
