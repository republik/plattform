const validate = matchChild =>
  ({ nodes }) => {
    if (!nodes) {
      return
    }
    const invalidChildren = nodes.filter(
      (child, index) =>
        matchChild(child) &&
        index !== nodes.findIndex(matchChild)
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

export default (matchNode, matchChild, reducer) => ({
  match: matchNode,
  validate: validate(matchChild),
  normalize: normalize(reducer)
})
