export default {
  match: node => node.kind === 'document',
  validate: document => {
    const invalidChildren = document.nodes.filter(
      (child, index) => child.type === 'lead' && index !== 1
    )
    return invalidChildren.size ? invalidChildren : null
  },
  normalize: (transform, document, invalidChildren) => {
    let updatedTransform = transform
    invalidChildren.forEach(child => {
      updatedTransform = transform.setNodeByKey(
        child.key,
        'p'
      )
    })

    return updatedTransform
  }
}
