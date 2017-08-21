export const validate = (index, matchChild) =>
  ({ nodes }) => {
    if (!nodes || nodes.size < index) {
      return
    }
    const node = nodes.get(index)
    return !matchChild(node) && node
  }

const normalize = reducer =>
  (transform, node, invalidChild) =>
    transform.setNodeByKey(
      invalidChild.key,
      reducer(invalidChild, node)
    )
   .apply()

export default (index, matchNode, matchChild, reducer) => ({
  match: matchNode,
  validate: validate(index, matchChild),
  normalize: normalize(reducer)
})
