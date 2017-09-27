import { Document } from 'slate'

const rawNodeToNode = (rawNode) => {
  const isDocument = rawNode.kind === 'document'
  if (isDocument) {
    return Document.fromJSON(rawNode)
  }
  return Document.fromJSON({
    nodes: [rawNode]
  }).nodes.first()
}

const addValidation = (rule, serializer, name) => {
  rule.validate = node => {
    const context = {}
    const rawNode = node.toJSON()
    const mdast = serializer.toMdast(rawNode, context)

    return context.dirty || context.missing
      ? mdast
      : null
  }
  rule.normalize = (change, object, mdast) => {
    const rawNode = serializer.fromMdast(mdast)
    const node = rawNodeToNode(
      rawNode.kind === 'state'
        ? rawNode.document
        : rawNode
    )

    const target = node.kind === 'document'
      ? change.state.document
      : object
    let t = change.setNodeByKey(target.key, {
      data: node.data
    })
    target.nodes.forEach(n => {
      t = t.removeNodeByKey(
        n.key
      )
    })
    node.nodes.forEach((n, i) => {
      t = t.insertNodeByKey(
        target.key,
        i,
        n
      )
    })
    return t
  }
}

export const findOrCreate = (nodes, targetNode, newProps) => {
  const match = node => Object.keys(targetNode)
    .every(key => node[key] === targetNode[key])
  const node = nodes.find(match)
  return node || {
    ...targetNode,
    ...newProps
  }
}

export default addValidation
