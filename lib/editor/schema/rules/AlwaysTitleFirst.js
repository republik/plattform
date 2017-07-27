import { Block } from 'slate'

export default {
  match: node => node.kind === 'document',
  validate: document =>
    !document.nodes.size ||
    document.nodes.first().type !== 'h1'
      ? document.nodes
      : null,
  normalize: (transform, document, nodes) => {
    if (!nodes.size) {
      const title = Block.create({
        type: 'h1',
        data: {}
      })
      return transform.insertNodeByKey(
        document.key,
        0,
        title
      )
    }

    return transform.setNodeByKey(nodes.first().key, 'h1')
  }
}
