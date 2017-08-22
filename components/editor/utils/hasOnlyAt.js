
export const validate = (index, matchChild) =>
  ({ nodes }) => {
    if (!nodes || nodes.size < index) {
      return
    }
    const invalidChildren = nodes.filter(
      (child, i) =>
        matchChild(child) &&
        index !== i
    )
    return invalidChildren.size && invalidChildren
  }

const normalize = reducer =>
  (transform, node, invalidChildren) =>
    invalidChildren
      .reduce(
        (t, invalidChild) =>
           t.setNodeByKey(
             invalidChild.key,
             reducer(invalidChild, node)
           ),
        transform
      )
     .apply()

export default (index, matchNode, matchChild, reducer) => ({
  match: matchNode,
  validate: validate(index, matchChild),
  normalize: normalize(reducer)
})
