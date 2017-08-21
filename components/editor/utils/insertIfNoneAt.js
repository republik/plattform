export const validate = (index, _) =>
  node => {
    if (!node || !node.nodes) {
      return
    }
    const child = node.nodes.get(index)
    if (!child) {
      return node
    }
  }

const normalize = (index, reducer) =>
  (transform, node, invalidNode) =>
    transform
      .insertNodeByKey(
        node.key,
        index,
        reducer(node, invalidNode)
      )
      .apply()

export default (index, matchNode, _, reducer) => ({
  match: matchNode,
  validate: validate(index, _),
  normalize: normalize(index, reducer)
})
