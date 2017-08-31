import { Raw, State, Document, Block } from 'slate'

const nodeToRawNode = (node) => {
  const state = State.create({
    document: Document.create({
      nodes: Block.createList([
        node
      ])
    })
  })
  return Raw.serialize(state).document.nodes[0]
}

const rawNodeToNode = (rawNode) => {
  return Raw.deserialize({
    kind: 'state',
    document: {
      kind: 'document',
      nodes: [rawNode]
    }
  }).document.nodes.first()
}

const addValidation = (rule, serializer) => {
  rule.validate = node => {
    const context = {}
    const rawNode = nodeToRawNode(node)
    const mdast = serializer.toMdast(rawNode, context)

    return context.dirty
      ? mdast
      : null
  }
  rule.normalize = (transform, object, mdast) => {
    const node = rawNodeToNode(
      serializer.fromMdast(mdast)
    )

    const parent = transform.state.document.getParent(object.key)
    const index = parent.nodes.findIndex(n => n === object)

    return transform
      .insertNodeByKey(
        parent.key,
        index,
        node
      )
      .removeNodeByKey(
        object.key
      )
  }
}

export default addValidation
