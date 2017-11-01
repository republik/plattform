export const findOrCreate = (nodes, targetNode, newProps) => {
  const match = node => Object.keys(targetNode)
    .every(key => node[key] === targetNode[key])
  const node = nodes.find(match)
  return node || {
    ...targetNode,
    ...newProps
  }
}
